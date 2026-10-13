import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  sql,
  type SQL,
} from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/session-access";
import { getDatabase, writeTransaction } from "@/lib/database";
import { media, mediaUploadLimit } from "@/lib/database/schema";

import type { DeleteMediaInput, MediaItem, MediaQuery, UploadInput } from "./schema";

import { MediaError } from "./error";
import { findMediaReferences } from "./references";
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

type MediaRow = typeof media.$inferSelect;
const LEASE_MS = 10 * 60_000;
const TOMBSTONE_MS = 24 * 60 * 60_000;
function authorize(actor: TaxonomyActor) {
  const admin = getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new MediaError("UNAUTHORIZED", "登录已失效，请重新登录。");
}
function leaseMatches(token: string | null) {
  return token === null ? isNull(media.leaseToken) : eq(media.leaseToken, token);
}
function serialize(row: MediaRow): MediaItem {
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
  authorize(actor);
  const db = getDatabase();
  const filters: SQL[] = [
    inArray(media.status, ["ready", "deleting"]),
    isNotNull(media.uploadedAt),
  ];
  if (query.record) filters.push(eq(media.id, query.record));
  if (!query.record && query.kind) filters.push(eq(media.kind, query.kind));
  if (!query.record && query.q)
    filters.push(sql`instr(lower(${media.name}), lower(${query.q})) > 0`);
  const where = and(...filters);
  const total = db.select({ total: count() }).from(media).where(where).get()!.total;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const rows = db
    .select()
    .from(media)
    .where(where)
    .orderBy(desc(media.createdAt), desc(media.id))
    .offset((page - 1) * query.pageSize)
    .limit(query.pageSize)
    .all();
  return { items: rows.map(serialize), total, page, pageSize: query.pageSize, pageCount };
}
export async function createUpload(input: UploadInput, actor: TaxonomyActor) {
  authorize(actor);
  storageConfig();
  const now = new Date();
  const window = Math.floor(now.getTime() / 60_000);
  const row = writeTransaction((tx) => {
    authorize(actor);
    const limit = tx
      .select()
      .from(mediaUploadLimit)
      .where(eq(mediaUploadLimit.adminId, actor.adminId))
      .get();
    if (limit?.window === window && limit.count >= 20)
      throw new MediaError(
        "RATE_LIMITED",
        "上传请求过于频繁，请稍后重试。",
        Math.ceil(((window + 1) * 60_000 - Date.now()) / 1000),
      );
    const total = tx
      .select({ total: count() })
      .from(media)
      .where(
        and(eq(media.adminId, actor.adminId), inArray(media.status, ["pending", "finalizing"])),
      )
      .get()!.total;
    if (total >= 20)
      throw new MediaError("RATE_LIMITED", "最多保留 20 个未完成上传，请完成上传或等待清理。", 60);
    if (limit)
      tx.update(mediaUploadLimit)
        .set({
          window,
          count: limit.window === window ? limit.count + 1 : 1,
        })
        .where(eq(mediaUploadLimit.adminId, actor.adminId))
        .run();
    else tx.insert(mediaUploadLimit).values({ adminId: actor.adminId, window, count: 1 }).run();
    const id = randomUUID();
    const stagingKey = `staging/${id}`;
    const objectKey = `media/${id}`;
    // URL 仅能签发一次，保留额外完成时间，允许已开始的 PUT 在签名期限后结束。
    const expiresAt = new Date(now.getTime() + 30 * 60_000);
    tx.insert(media)
      .values({
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
      })
      .run();
    return { id, stagingKey };
  });
  try {
    const signed = await signUpload(row.stagingKey, input.bytes);
    authorize(actor);
    return {
      id: row.id,
      ...signed,
      expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString(),
    };
  } catch (error) {
    writeTransaction((tx) =>
      tx
        .update(media)
        .set({ status: "deleted", deletedAt: new Date() })
        .where(and(eq(media.id, row.id), eq(media.status, "pending")))
        .run(),
    );
    throw storageFailure(error);
  }
}
function processing() {
  return new MediaError("PROCESSING", "文件正在处理，请稍后重试。", 5);
}
export async function completeUpload(id: string, actor: TaxonomyActor) {
  authorize(actor);
  const token = randomUUID();
  const row = writeTransaction((tx) => {
    authorize(actor);
    const current = tx
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.adminId, actor.adminId)))
      .get();
    if (!current) throw new MediaError("NOT_FOUND", "上传记录不存在。");
    if (current.status === "ready") return current;
    if (current.status === "finalizing") throw processing();
    if (current.status !== "pending" || current.expiresAt.getTime() <= Date.now())
      throw new MediaError("UPLOAD_EXPIRED", "上传已过期或被清理，请重新上传。");
    const leaseUntil = new Date(Date.now() + LEASE_MS);
    if (
      !tx
        .update(media)
        .set({
          status: "finalizing",
          leaseToken: token,
          leaseUntil,
        })
        .where(and(eq(media.id, id), eq(media.status, "pending")))
        .run().changes
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
        writeTransaction((tx) => {
          authorize(actor);
          if (
            !tx
              .update(media)
              .set({ leaseUntil: new Date(Date.now() + LEASE_MS) })
              .where(
                and(
                  eq(media.id, id),
                  eq(media.status, "finalizing"),
                  eq(media.leaseToken, token),
                  gt(media.leaseUntil, new Date()),
                ),
              )
              .run().changes
          )
            throw processing();
        });
      },
      signal,
    );
    const ready = writeTransaction((tx) => {
      authorize(actor);
      const uploadedAt = new Date();
      if (
        !tx
          .update(media)
          .set({
            ...data,
            status: "ready",
            uploadedAt,
            leaseToken: null,
            leaseUntil: null,
          })
          .where(
            and(
              eq(media.id, id),
              eq(media.status, "finalizing"),
              eq(media.leaseToken, token),
              gt(media.leaseUntil, new Date()),
            ),
          )
          .run().changes
      )
        throw processing();
      return { ...row, ...data, status: "ready", uploadedAt };
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
        writeTransaction((tx) =>
          tx
            .update(media)
            .set({
              status:
                error instanceof MediaError && error.code === "INVALID_INPUT"
                  ? "deleting"
                  : "pending",
              leaseToken: null,
              leaseUntil: null,
            })
            .where(
              and(eq(media.id, id), eq(media.status, "finalizing"), eq(media.leaseToken, token)),
            )
            .run(),
        );
      } catch (cleanupError) {
        storageFailure(cleanupError);
        // 保留 finalizing 和租约，清理器恢复前不允许再次发布该 key。
      }
    }
    throw storageFailure(error);
  }
}
async function erase(row: MediaRow, token: string) {
  try {
    await removeObject(row.objectKey);
    await removeObject(row.stagingKey);
    writeTransaction((tx) => {
      if (
        !tx
          .update(media)
          .set({
            status: "deleted",
            deletedAt: row.deletedAt ?? new Date(),
            leaseToken: null,
            leaseUntil: null,
          })
          .where(
            and(eq(media.id, row.id), eq(media.status, "deleting"), eq(media.leaseToken, token)),
          )
          .run().changes
      )
        throw processing();
    });
  } catch (error) {
    writeTransaction((tx) =>
      tx
        .update(media)
        .set({ leaseToken: null, leaseUntil: null })
        .where(and(eq(media.id, row.id), eq(media.status, "deleting"), eq(media.leaseToken, token)))
        .run(),
    );
    throw storageFailure(error);
  }
}
export async function getMediaReferences(id: string, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    const row = tx
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.adminId, actor.adminId)))
      .get();
    if (!row || !["ready", "deleting"].includes(row.status))
      throw new MediaError("NOT_FOUND", "媒体记录不存在。");
    return findMediaReferences(tx, row.objectKey);
  });
}
export async function deleteMedia(
  id: string,
  actor: TaxonomyActor,
  input: DeleteMediaInput = { force: false },
) {
  authorize(actor);
  const token = randomUUID();
  const row = writeTransaction((tx) => {
    authorize(actor);
    const current = tx
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.adminId, actor.adminId)))
      .get();
    if (!current) throw new MediaError("NOT_FOUND", "媒体记录不存在。");
    if (current.status === "deleted") return current;
    if (current.status === "ready") {
      const references = findMediaReferences(tx, current.objectKey);
      if (input.referenceFingerprint && input.referenceFingerprint !== references.fingerprint)
        throw new MediaError("REFERENCES_CHANGED", "媒体引用已变化，请重新查看并确认删除。");
      if (references.count && !input.force)
        throw new MediaError("RESOURCE_IN_USE", "文件仍被引用，请查看引用并明确确认强制删除。");
      if (references.count && !input.referenceFingerprint)
        throw new MediaError("REFERENCES_CHANGED", "强制删除前必须查看当前引用。");
    }
    if (
      current.status === "finalizing" ||
      (current.leaseUntil && current.leaseUntil.getTime() > Date.now())
    )
      throw processing();
    if (
      !tx
        .update(media)
        .set({
          status: "deleting",
          leaseToken: token,
          leaseUntil: new Date(Date.now() + LEASE_MS),
        })
        .where(
          and(eq(media.id, id), eq(media.status, current.status), leaseMatches(current.leaseToken)),
        )
        .run().changes
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
    const rows = db
      .select()
      .from(media)
      .where(
        and(
          gt(media.id, cursor),
          inArray(media.status, ["pending", "finalizing", "ready", "deleting", "deleted"]),
        ),
      )
      .orderBy(asc(media.id))
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
          writeTransaction((tx) =>
            tx
              .update(media)
              .set({ stagingCleanedAt: new Date() })
              .where(and(eq(media.id, row.id), eq(media.status, "ready")))
              .run(),
          );
          result.cleaned += 1;
          continue;
        }
        const token = randomUUID();
        const claimed = writeTransaction((tx) => {
          const where = and(
            eq(media.id, row.id),
            eq(media.status, row.status),
            leaseMatches(row.leaseToken),
          );
          const current = tx.select().from(media).where(where).get();
          if (!current || (current.leaseUntil && current.leaseUntil.getTime() > Date.now()))
            return false;
          return Boolean(
            tx
              .update(media)
              .set({
                status: "deleting",
                leaseToken: token,
                leaseUntil: new Date(Date.now() + LEASE_MS),
              })
              .where(where)
              .run().changes,
          );
        });
        if (!claimed) continue;
        await erase(row, token);
        // 墓碑至少保留一天，继续回收签名重放或中断操作可能留下的对象。
        if (row.deletedAt && row.deletedAt.getTime() + TOMBSTONE_MS < Date.now())
          writeTransaction((tx) =>
            tx
              .delete(media)
              .where(
                and(eq(media.id, row.id), eq(media.status, "deleted"), isNull(media.leaseToken)),
              )
              .run(),
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
