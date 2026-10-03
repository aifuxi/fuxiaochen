import "dotenv/config";
import type { JSONContent } from "@tiptap/core";

import { createHash, randomUUID } from "node:crypto";
import { chmodSync, existsSync } from "node:fs";
import { mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";
import sharp from "sharp";
import { z } from "zod";

import { databasePath } from "../lib/database-path";
import { IMAGE_MAX_BYTES, uploadSchema } from "../lib/media/schema";
import {
  closeStorage,
  headImportedImage,
  publicMediaUrl,
  putImportedImage,
  storageConfig,
} from "../lib/media/storage";
import { postContentSchema, readDocument, serializeDocument } from "../lib/posts/document";
import { getDatabase } from "../prisma/db";

class MigrationError extends Error {}
const SOURCE_ORIGIN = "https://aifuxi.oss-cn-shanghai.aliyuncs.com";
const PIXEL_LIMIT = 40_000_000;
// 已确认的六张历史动图：仅此清单允许累计像素超限，单帧和解码批次仍保留原限制。
const LONG_ANIMATIONS = new Set([
  "/fuxiaochen-go/chang-ip-use-devtools-example.gif",
  "/fuxiaochen/20240520-200128-u5z6ufuxb347l39mv4tvoh5g.webp",
  "/fuxiaochen/oh-my-zsh-showcase-wpyx16m7b2paqbhp4bbeejhc.webp",
  "/fuxiaochen/Kapture 2024-03-29 at 01.04.06-vgrmfef50264wz8rbdmage1v.webp",
  "/fuxiaochen/random-theme-np8ny77eiiu21g8zjtmyc18r.webp",
  "/fuxiuaochen/prettier-ignore-demo-p7a4lv17mebzsgk893ec4tak.webp",
]);
const rowsSchema = z.array(
  z.object({ id: z.string(), content: z.string(), version: z.number().int() }),
);
type Row = z.infer<typeof rowsSchema>[number];
const entrySchema = z.strictObject({
  source: z.url(),
  id: z.uuid(),
  name: z.string().min(1).max(255),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().min(1).max(IMAGE_MAX_BYTES),
  mime: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]),
  width: z.number().int().min(1).max(10_000),
  height: z.number().int().min(1).max(10_000),
  frames: z.number().int().min(1),
  uploadedAt: z.iso.datetime().nullable(),
});
const manifestSchema = z.strictObject({
  version: z.literal(1),
  database: z.string(),
  bucket: z.string(),
  publicOrigin: z.url(),
  backupPath: z.string().nullable(),
  completedAt: z.iso.datetime().nullable(),
  entries: z.array(entrySchema),
});
type Entry = z.infer<typeof entrySchema>;
type Manifest = z.infer<typeof manifestSchema>;

function visitImages(document: JSONContent, visit: (node: JSONContent) => void) {
  if (document.type === "image") visit(document);
  document.content?.forEach((child) => visitImages(child, visit));
}
function sourceImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.hostname !== new URL(SOURCE_ORIGIN).hostname) return null;
  if (url.origin !== SOURCE_ORIGIN || url.username || url.password || url.search || url.hash)
    throw new MigrationError(`旧图片地址不符合迁移范围：${url.pathname}`);
  return url.href;
}
async function download(url: string) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok || !response.body)
    throw new MigrationError(`图片读取失败（HTTP ${response.status}）：${new URL(url).pathname}`);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > IMAGE_MAX_BYTES) throw new MigrationError("图片超过 20 MiB，已取消迁移。");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  if (!bytes) throw new MigrationError("图片文件为空，已取消迁移。");
  return {
    body: Buffer.concat(chunks, bytes),
    mime: response.headers.get("content-type")?.split(";")[0],
  };
}
async function inspectImage(source: string, body: Buffer) {
  const options = { limitInputPixels: PIXEL_LIMIT, failOn: "warning" as const };
  const meta = await sharp(body, { ...options, pages: 1 }).metadata();
  const formats: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const mime =
    meta.format === "heif" && meta.compression === "av1"
      ? "image/avif"
      : formats[meta.format ?? ""];
  const width = meta.width ?? 0;
  const height = meta.pageHeight ?? meta.height ?? 0;
  const frames = meta.pages ?? 1;
  const pixels = width * height;
  if (!mime || !pixels || pixels > PIXEL_LIMIT)
    throw new MigrationError(`图片格式或单帧尺寸无效：${new URL(source).pathname}`);
  if (pixels * frames <= PIXEL_LIMIT) {
    await sharp(body, { ...options, animated: true })
      .timeout({ seconds: 30 })
      .stats();
  } else {
    if (
      !LONG_ANIMATIONS.has(decodeURIComponent(new URL(source).pathname)) ||
      !["gif", "webp"].includes(meta.format ?? "") ||
      frames > 600 ||
      pixels * frames > 400_000_000
    )
      throw new MigrationError(`动图不属于已批准的历史迁移范围：${new URL(source).pathname}`);
    // 每批最多解码 4000 万像素，覆盖所有帧，避免将长动图整体展开到内存。
    const batchSize = Math.floor(PIXEL_LIMIT / pixels);
    for (let page = 0; page < frames; page += batchSize)
      await sharp(body, { ...options, page, pages: Math.min(batchSize, frames - page) })
        .timeout({ seconds: 30 })
        .stats();
  }
  return { mime, width, height, frames };
}
const digest = (body: Buffer | string) => createHash("sha256").update(body).digest("hex");
async function saveManifest(path: string, manifest: Manifest) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, {
      mode: 0o600,
      flag: "wx",
    });
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}
async function publish(entry: Entry, body: Buffer) {
  const key = `media/${entry.id}`;
  const current = await headImportedImage(key);
  if (current) {
    if (
      current.ContentLength !== entry.bytes ||
      current.ContentType !== entry.mime ||
      current.Metadata?.sha256 !== entry.sha256
    )
      throw new MigrationError(`目标对象校验不一致，拒绝覆盖：${key}`);
  } else {
    await putImportedImage(key, body, entry.mime, entry.sha256);
  }
  const published = await download(publicMediaUrl(key));
  if (
    published.body.length !== entry.bytes ||
    digest(published.body) !== entry.sha256 ||
    published.mime !== entry.mime
  )
    throw new MigrationError(`公开图片内容校验失败：${key}`);
  entry.uploadedAt ??= new Date().toISOString();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !["--dry-run", "--write"].includes(args[0]))
    throw new MigrationError(
      "用法：npm run posts:migrate-images -- --dry-run 或 --write。写入前必须停止应用、调度及其他数据库写入进程。",
    );
  const write = args[0] === "--write";
  const path = databasePath();
  if (!existsSync(path)) throw new MigrationError("目标数据库不存在，请检查 DATABASE_PATH。");
  const config = storageConfig();
  if (config.publicOrigin === SOURCE_ORIGIN)
    throw new MigrationError("目标媒体域名仍是旧桶，请检查 OSS 配置。");
  const source = new DatabaseSync(path, { readOnly: true });
  let rows: Row[];
  try {
    source.exec("BEGIN");
    rows = rowsSchema.parse(
      source.prepare("SELECT id, content, version FROM post ORDER BY id").all(),
    );
    const admins = source.prepare("SELECT id FROM admin ORDER BY id").all();
    if (admins.length !== 1 || admins[0].id !== 1)
      throw new MigrationError("迁移仅适用于唯一管理员 id=1，未写入任何数据。");
    source.exec("COMMIT");
  } finally {
    source.close();
  }
  const urls = new Set<string>();
  const documents = new Map<string, JSONContent>();
  let references = 0;
  for (const row of rows) {
    const document = readDocument(row.content);
    let affected = false;
    visitImages(document, (node) => {
      const url = sourceImage(node.attrs?.src);
      if (!url) return;
      urls.add(url);
      references++;
      affected = true;
    });
    if (affected) documents.set(row.id, document);
  }
  console.log(
    `文章 ${rows.length} 篇，待迁移 ${documents.size} 篇，图片引用 ${references} 处，独立图片 ${urls.size} 张。`,
  );
  if (!urls.size) return;
  const directory = resolve("data");
  const manifestPath = resolve(
    directory,
    `posts-images-${digest(JSON.stringify([path, config.bucket, config.publicOrigin])).slice(0, 16)}.json`,
  );
  const lockPath = `${manifestPath}.lock`;
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  let db: ReturnType<typeof getDatabase> | undefined;
  try {
    if (write) {
      await mkdir(directory, { recursive: true, mode: 0o700 });
      try {
        lock = await open(lockPath, "wx", 0o600);
      } catch {
        throw new MigrationError(`迁移锁已存在或无法创建：${lockPath}。确认没有迁移进程后再处理。`);
      }
      await lock.writeFile(`${process.pid}\n`);
    }
    const manifest = existsSync(manifestPath)
      ? manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")))
      : manifestSchema.parse({
          version: 1,
          database: path,
          bucket: config.bucket,
          publicOrigin: config.publicOrigin,
          backupPath: null,
          completedAt: null,
          entries: [],
        });
    if (
      manifest.database !== path ||
      manifest.bucket !== config.bucket ||
      manifest.publicOrigin !== config.publicOrigin
    )
      throw new MigrationError("迁移进度与当前数据库或 OSS 配置不一致。");
    const entries = new Map(manifest.entries.map((entry) => [entry.source, entry]));
    if (
      entries.size !== manifest.entries.length ||
      new Set(manifest.entries.map((entry) => entry.id)).size !== manifest.entries.length
    )
      throw new MigrationError("迁移进度包含重复地址或对象 ID。");
    for (const url of urls) {
      const { body } = await download(url);
      const image = await inspectImage(url, body);
      const hash = digest(body);
      const name = decodeURIComponent(new URL(url).pathname.split("/").at(-1)!);
      uploadSchema.parse({ name, kind: "image", bytes: body.length, sha256: hash });
      let entry = entries.get(url);
      if (entry) {
        if (
          entry.sha256 !== hash ||
          entry.bytes !== body.length ||
          entry.mime !== image.mime ||
          entry.width !== image.width ||
          entry.height !== image.height ||
          entry.frames !== image.frames
        )
          throw new MigrationError(`源图片已变化，保留原进度并停止迁移：${name}`);
      } else {
        entry = entrySchema.parse({
          source: url,
          id: randomUUID(),
          name,
          sha256: hash,
          bytes: body.length,
          ...image,
          uploadedAt: null,
        });
        entries.set(url, entry);
        manifest.entries.push(entry);
      }
      if (write) {
        // 先持久化随机对象 ID，响应丢失或中断后能检查并复用同一个对象。
        await saveManifest(manifestPath, manifest);
        await publish(entry, body);
        await saveManifest(manifestPath, manifest);
      }
      console.log(
        `${write ? "已上传并验证" : "预检查通过"}：${entry.name}，${entry.mime}，${entry.width}×${entry.height}，${entry.frames} 帧。`,
      );
    }
    if (!write) {
      console.log("全部源图片预检查通过；未上传文件、修改数据库或写入迁移进度。");
      return;
    }
    const pending = rows
      .filter((row) => documents.has(row.id))
      .map((row) => {
        const document = documents.get(row.id)!;
        visitImages(document, (node) => {
          const url = sourceImage(node.attrs?.src);
          if (url) node.attrs!.src = publicMediaUrl(`media/${entries.get(url)!.id}`);
        });
        return { ...row, normalized: postContentSchema.parse(serializeDocument(document)) };
      });
    const beforeWrite = new DatabaseSync(path, { readOnly: true });
    try {
      manifest.backupPath = `${path}.posts-images-${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}.sqlite`;
      await backup(beforeWrite, manifest.backupPath);
      chmodSync(manifest.backupPath, 0o600);
    } finally {
      beforeWrite.close();
    }
    await saveManifest(manifestPath, manifest);
    console.log(`迁移前备份：${manifest.backupPath}`);
    db = getDatabase();
    await db.transaction(async (tx) => {
      const current = await tx.orm.Post.select("id", "content", "version")
        .orderBy((p) => p.id.asc())
        .all();
      if (
        current.length !== rows.length ||
        current.some(
          (row, index) =>
            row.id !== rows[index].id ||
            row.version !== rows[index].version ||
            row.content !== rows[index].content,
        )
      )
        throw new MigrationError("预检查后文章发生变化，迁移事务已取消。请停止写入进程后重试。");
      for (const url of urls) {
        const entry = entries.get(url)!;
        const existing = await tx.orm.Media.where({ id: entry.id }).first();
        if (existing) {
          if (
            existing.status !== "ready" ||
            existing.adminId !== 1 ||
            existing.kind !== "image" ||
            existing.objectKey !== `media/${entry.id}` ||
            existing.sha256 !== entry.sha256 ||
            existing.bytes !== entry.bytes ||
            existing.mime !== entry.mime ||
            existing.width !== entry.width ||
            existing.height !== entry.height ||
            !existing.uploadedAt
          )
            throw new MigrationError(`媒体记录与迁移进度不一致：${entry.id}`);
          continue;
        }
        const uploadedAt = new Date(entry.uploadedAt!);
        await tx.orm.Media.create({
          id: entry.id,
          adminId: 1,
          name: entry.name,
          kind: "image",
          expectedBytes: entry.bytes,
          sha256: entry.sha256,
          stagingKey: `staging/${entry.id}`,
          // 直接上传正式对象，不产生 staging 对象；标记已清理，符合现有生命周期。
          stagingCleanedAt: uploadedAt,
          objectKey: `media/${entry.id}`,
          bytes: entry.bytes,
          mime: entry.mime,
          width: entry.width,
          height: entry.height,
          status: "ready",
          createdAt: uploadedAt,
          uploadedAt,
          expiresAt: uploadedAt,
        });
      }
      for (const row of pending) {
        const count = await tx.orm.Post.where({
          id: row.id,
          version: row.version,
          content: row.content,
        }).updateAndCount({ content: row.normalized, version: row.version + 1 });
        if (count !== 1) throw new MigrationError(`文章 ${row.id} 已变化，迁移事务已取消。`);
      }
      const migrated = await tx.orm.Post.select("content").all();
      if (migrated.length !== rows.length)
        throw new MigrationError("文章数量变化，迁移事务已取消。");
      for (const row of migrated) {
        const document = readDocument(postContentSchema.parse(row.content));
        visitImages(document, (node) => {
          if (sourceImage(node.attrs?.src))
            throw new MigrationError("正文仍有旧桶图片，迁移事务已取消。");
        });
      }
    });
    console.log(
      `已提交迁移：${pending.length} 篇文章、${urls.size} 张图片、${references} 处引用。进度：${manifestPath}`,
    );
    manifest.completedAt = new Date().toISOString();
    try {
      await saveManifest(manifestPath, manifest);
    } catch {
      throw new MigrationError(
        "数据库迁移已提交，但完成标记保存失败；请只读核对，重复运行不会再次修改已迁移文章。",
      );
    }
  } finally {
    try {
      await db?.close();
    } finally {
      closeStorage();
      if (lock) {
        await lock.close();
        await unlink(lockPath);
      }
    }
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof MigrationError
      ? error.message
      : `迁移中止（${error instanceof Error ? error.name : "UnknownError"}）。请检查图片、OSS 配置与进度文件；尚未提交的数据库事务会回滚，已上传对象保留供重试。`,
  );
  process.exitCode = 1;
});
