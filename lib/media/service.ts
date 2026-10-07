import "server-only";
import { randomUUID } from "node:crypto";

import type { Models } from "@/generated/prisma/contract";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import type { MediaItem, MediaQuery, UploadInput } from "./schema";

import { MediaError } from "./error";
import { mediaKindSchema } from "./schema";
import {
  publicMediaUrl,
  removeObject,
  signUpload,
  storageConfig,
  storageFailure,
  UPLOAD_TTL_SECONDS,
  verifyAndPublish,
} from "./storage";

const LEASE_MS = 10 * 60_000;
const TOMBSTONE_MS = 24 * 60 * 60_000;
async function authorize(actor: TaxonomyActor) {
  const admin = await getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new MediaError("UNAUTHORIZED", "登录已失效，请重新登录。");
}
function serialize(row: Models.public_Media): MediaItem {
  if (!row.bytes || !row.mime || !row.uploadedAt || !["ready", "deleting"].includes(row.status))
    throw new Error("Incomplete media record");
  return {
    id: row.id,
    name: row.name,
    kind: mediaKindSchema.parse(row.kind),
    bytes: row.bytes,
    mime: row.mime,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt.toISOString(),
    uploadedAt: row.uploadedAt.toISOString(),
    status: row.status === "ready" ? "ready" : "deleting",
    url: row.status === "ready" ? publicMediaUrl(row.objectKey) : null,
  };
}
export async function listMedia(query: MediaQuery, actor: TaxonomyActor) {
  await authorize(actor);
  const db = getDatabase();
  let filtered = db.orm.public.Media.where((m) => m.status.in(["ready", "deleting"])).where((m) =>
    m.uploadedAt.isNotNull(),
  );
  if (query.record) filtered = filtered.where({ id: query.record });
  if (!query.record && query.kind) filtered = filtered.where({ kind: query.kind });
  if (!query.record && query.q)
    filtered = filtered.where((m) =>
      db.raw.sql`strpos(lower(${m.name}), lower(${query.q})) > 0`.returns("pg/bool@1").buildAst(),
    );
  const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const rows = await filtered
    .orderBy([(m) => m.createdAt.desc(), (m) => m.id.desc()])
    .offset((page - 1) * query.pageSize)
    .limit(query.pageSize)
    .all();
  return { items: rows.map(serialize), total, page, pageSize: query.pageSize, pageCount };
}
export async function createUpload(input: UploadInput, actor: TaxonomyActor) {
  await authorize(actor);
  storageConfig();
  const now = new Date();
  const window = Math.floor(now.getTime() / 60_000);
  const row = await writeTransaction(async (tx) => {
    await authorize(actor);
    const limit = await tx.orm.public.MediaUploadLimit.where({ adminId: actor.adminId }).first();
    if (limit?.window === window && limit.count >= 20)
      throw new MediaError(
        "RATE_LIMITED",
        "上传请求过于频繁，请稍后重试。",
        Math.ceil(((window + 1) * 60_000 - Date.now()) / 1000),
      );
    const { total } = await tx.orm.public.Media.where({ adminId: actor.adminId })
      .where((m) => m.status.in(["pending", "finalizing"]))
      .aggregate((agg) => ({ total: agg.count() }));
    if (total >= 20)
      throw new MediaError("RATE_LIMITED", "最多保留 20 个未完成上传，请完成上传或等待清理。", 60);
    if (limit)
      await tx.orm.public.MediaUploadLimit.where({ adminId: actor.adminId }).update({
        window,
        count: limit.window === window ? limit.count + 1 : 1,
      });
    else await tx.orm.public.MediaUploadLimit.create({ adminId: actor.adminId, window, count: 1 });
    const id = randomUUID();
    const stagingKey = `staging/${id}`;
    const objectKey = `media/${id}`;
    // URL 仅能签发一次，保留额外完成时间，允许已开始的 PUT 在签名期限后结束。
    const expiresAt = new Date(now.getTime() + 30 * 60_000);
    await tx.orm.public.Media.create({
      id,
      adminId: actor.adminId,
      name: input.name,
      kind: input.kind,
      expectedBytes: input.bytes,
      sha256: input.sha256,
      stagingKey,
      objectKey,
      status: "pending",
      createdAt: now,
      expiresAt,
    });
    return { id, stagingKey };
  });
  try {
    const signed = await signUpload(row.stagingKey, input.bytes);
    await authorize(actor);
    return {
      id: row.id,
      ...signed,
      expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString(),
    };
  } catch (error) {
    await writeTransaction((tx) =>
      tx.orm.public.Media.where({ id: row.id, status: "pending" }).update({
        status: "deleted",
        deletedAt: new Date(),
      }),
    );
    throw storageFailure(error);
  }
}
function processing() {
  return new MediaError("PROCESSING", "文件正在处理，请稍后重试。", 5);
}
export async function completeUpload(id: string, actor: TaxonomyActor) {
  await authorize(actor);
  const token = randomUUID();
  const row = await writeTransaction(async (tx) => {
    await authorize(actor);
    const current = await tx.orm.public.Media.where({ id, adminId: actor.adminId }).first();
    if (!current) throw new MediaError("NOT_FOUND", "上传记录不存在。");
    if (current.status === "ready") return current;
    if (current.status === "finalizing") throw processing();
    if (current.status !== "pending" || current.expiresAt.getTime() <= Date.now())
      throw new MediaError("UPLOAD_EXPIRED", "上传已过期或被清理，请重新上传。");
    const leaseUntil = new Date(Date.now() + LEASE_MS);
    if (
      !(await tx.orm.public.Media.where({ id, status: "pending" }).updateAndCount({
        status: "finalizing",
        leaseToken: token,
        leaseUntil,
      }))
    )
      throw processing();
    return { ...current, status: "finalizing", leaseToken: token, leaseUntil };
  });
  if (row.status === "ready") return serialize(row);
  // 100 MiB 附件需要更长的读取与发布时间；总时限仍短于 10 分钟处理租约。
  const signal = AbortSignal.timeout(5 * 60_000);
  let committed = false;
  try {
    const data = await verifyAndPublish(
      row,
      async () => {
        await writeTransaction(async (tx) => {
          await authorize(actor);
          if (
            !(await tx.orm.public.Media.where({ id, status: "finalizing", leaseToken: token })
              .where((m) => m.leaseUntil.gt(new Date()))
              .updateAndCount({ leaseUntil: new Date(Date.now() + LEASE_MS) }))
          )
            throw processing();
        });
      },
      signal,
    );
    const ready = await writeTransaction(async (tx) => {
      await authorize(actor);
      if (
        !(await tx.orm.public.Media.where({ id, status: "finalizing", leaseToken: token })
          .where((m) => m.leaseUntil.gt(new Date()))
          .updateAndCount({
            ...data,
            status: "ready",
            uploadedAt: new Date(),
            leaseToken: null,
            leaseUntil: null,
          }))
      )
        throw processing();
      return { ...row, ...data, status: "ready", uploadedAt: new Date() };
    });
    committed = true;
    // 删除临时对象不是已完成写入的成功条件；失败由清理 CLI 和生命周期回收。
    try {
      await removeObject(row.stagingKey);
    } catch (error) {
      storageFailure(error);
    }
    return serialize(ready);
  } catch (error) {
    if (!committed) {
      try {
        await removeObject(row.objectKey);
        await writeTransaction((tx) =>
          tx.orm.public.Media.where({ id, status: "finalizing", leaseToken: token }).update({
            status:
              error instanceof MediaError && error.code === "INVALID_INPUT"
                ? "deleting"
                : "pending",
            leaseToken: null,
            leaseUntil: null,
          }),
        );
      } catch (cleanupError) {
        storageFailure(cleanupError);
        // 保留 finalizing 和租约，清理器恢复前不允许再次发布该 key。
      }
    }
    throw storageFailure(error);
  }
}
async function erase(row: Models.public_Media, token: string) {
  try {
    await removeObject(row.objectKey);
    await removeObject(row.stagingKey);
    await writeTransaction(async (tx) => {
      if (
        !(await tx.orm.public.Media.where({
          id: row.id,
          status: "deleting",
          leaseToken: token,
        }).updateAndCount({
          status: "deleted",
          deletedAt: row.deletedAt ?? new Date(),
          leaseToken: null,
          leaseUntil: null,
        }))
      )
        throw processing();
    });
  } catch (error) {
    await writeTransaction((tx) =>
      tx.orm.public.Media.where({ id: row.id, status: "deleting", leaseToken: token }).update({
        leaseToken: null,
        leaseUntil: null,
      }),
    );
    throw storageFailure(error);
  }
}
export async function deleteMedia(id: string, actor: TaxonomyActor) {
  await authorize(actor);
  const token = randomUUID();
  const row = await writeTransaction(async (tx) => {
    await authorize(actor);
    const current = await tx.orm.public.Media.where({ id, adminId: actor.adminId }).first();
    if (!current) throw new MediaError("NOT_FOUND", "媒体记录不存在。");
    if (current.status === "deleted") return current;
    if (
      current.status === "finalizing" ||
      (current.leaseUntil && current.leaseUntil.getTime() > Date.now())
    )
      throw processing();
    if (
      !(await tx.orm.public.Media.where({
        id,
        status: current.status,
        leaseToken: current.leaseToken,
      }).updateAndCount({
        status: "deleting",
        leaseToken: token,
        leaseUntil: new Date(Date.now() + LEASE_MS),
      }))
    )
      throw processing();
    return current;
  });
  if (row.status !== "deleted") await erase(row, token);
  return { id };
}

export async function cleanupMedia(dryRun: boolean) {
  storageConfig();
  const db = getDatabase();
  const now = new Date();
  // 分批读取，避免清理任务随媒体库增长一次性加载全部记录。
  let cursor = "";
  const result = { scanned: 0, cleaned: 0, failed: 0, dryRun };
  while (true) {
    const rows = await db.orm.public.Media.where((m) => m.id.gt(cursor))
      .where((m) => m.status.in(["pending", "finalizing", "ready", "deleting", "deleted"]))
      .orderBy((m) => m.id.asc())
      .limit(100)
      .all();
    if (!rows.length) break;
    for (const row of rows) {
      cursor = row.id;
      const leased = row.leaseUntil && row.leaseUntil.getTime() > now.getTime();
      const expired = row.expiresAt.getTime() <= now.getTime();
      if (
        leased ||
        (row.status === "pending" && !expired) ||
        (row.status === "ready" && (!expired || row.stagingCleanedAt))
      )
        continue;
      result.scanned += 1;
      if (dryRun) continue;
      try {
        if (row.status === "ready") {
          await removeObject(row.stagingKey);
          await writeTransaction((tx) =>
            tx.orm.public.Media.where({ id: row.id, status: "ready" }).update({
              stagingCleanedAt: new Date(),
            }),
          );
          result.cleaned += 1;
          continue;
        }
        const token = randomUUID();
        const claimed = await writeTransaction(async (tx) => {
          const current = await tx.orm.public.Media.where({
            id: row.id,
            status: row.status,
            leaseToken: row.leaseToken,
          }).first();
          if (!current || (current.leaseUntil && current.leaseUntil.getTime() > Date.now()))
            return false;
          return Boolean(
            await tx.orm.public.Media.where({
              id: row.id,
              status: row.status,
              leaseToken: row.leaseToken,
            }).updateAndCount({
              status: "deleting",
              leaseToken: token,
              leaseUntil: new Date(Date.now() + LEASE_MS),
            }),
          );
        });
        if (!claimed) continue;
        await erase(row, token);
        // 墓碑至少保留一天，继续回收签名重放或中断操作可能留下的对象。
        if (row.deletedAt && row.deletedAt.getTime() + TOMBSTONE_MS < Date.now())
          await writeTransaction((tx) =>
            tx.orm.public.Media.where({
              id: row.id,
              status: "deleted",
              leaseToken: null,
            }).deleteAndCount(),
          );
        result.cleaned += 1;
      } catch (error) {
        storageFailure(error);
        result.failed += 1;
      }
    }
  }
  return result;
}
