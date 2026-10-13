import "server-only";
import type { z } from "zod";

import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { AdminBusinessError, authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction } from "@/lib/database";
import { releaseLog } from "@/lib/database/schema";

import {
  releaseSchema,
  releaseStatusSchema,
  type releaseQuerySchema,
  type ReleaseInput,
  type ReleaseUpdateInput,
  type ReleaseVisibilityInput,
} from "./schema";
type Row = typeof releaseLog.$inferSelect;
function serialize(row: Row) {
  const { id, createdAt, changes, status, revision, updatedAt, ...fields } = row;
  return {
    ...releaseSchema.parse({ ...fields, changes: JSON.parse(changes) }),
    id,
    createdAt: createdAt.toISOString(),
    updatedAt: (updatedAt ?? createdAt).toISOString(),
    status: releaseStatusSchema.parse(status),
    revision,
  };
}
export async function listReleases(
  query: z.infer<typeof releaseQuerySchema>,
  actor: TaxonomyActor,
) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor);
    const filters: SQL[] = [];
    if (query.record) filters.push(eq(releaseLog.id, query.record));
    if (!query.record && query.status) filters.push(eq(releaseLog.status, query.status));
    if (!query.record && query.q)
      // json_each 逐项检索实际更新内容，保留 %、_ 的字面含义。
      filters.push(sql`(
        instr(lower(${releaseLog.version}), lower(${query.q})) > 0 OR
        instr(lower(${releaseLog.title}), lower(${query.q})) > 0 OR
        EXISTS (SELECT 1 FROM json_each(${releaseLog.changes}) AS changes_item WHERE instr(lower(changes_item.value), lower(${query.q})) > 0)
      )`);
    const where = and(...filters);
    const total = tx.select({ total: count() }).from(releaseLog).where(where).get()!.total;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = tx
      .select()
      .from(releaseLog)
      .where(where)
      .orderBy(desc(releaseLog.createdAt), desc(releaseLog.id))
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    return { items: rows.map(serialize), total, page, pageCount, pageSize: query.pageSize };
  });
}
export async function createRelease(input: ReleaseInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor);
    const now = new Date();
    return serialize(
      tx
        .insert(releaseLog)
        .values({
          ...input,
          changes: JSON.stringify(input.changes),
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get(),
    );
  });
}
export async function getRelease(id: string, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor);
    const row = tx.select().from(releaseLog).where(eq(releaseLog.id, id)).get();
    if (!row) throw new AdminBusinessError("NOT_FOUND", "更新日志不存在，可能已被删除。");
    return serialize(row);
  });
}
export async function updateRelease(
  id: string,
  input: ReleaseUpdateInput | ReleaseVisibilityInput,
  actor: TaxonomyActor,
) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor);
    const previous = tx.select().from(releaseLog).where(eq(releaseLog.id, id)).get();
    if (!previous) throw new AdminBusinessError("NOT_FOUND", "更新日志不存在，可能已被删除。");
    if (previous.revision !== input.revision)
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "更新日志已被其他页面修改，请重新载入后核对。",
      );
    const fields =
      "status" in input
        ? { status: input.status }
        : {
            version: input.version,
            title: input.title,
            type: input.type,
            changes: JSON.stringify(input.changes),
          };
    if (
      !tx
        .update(releaseLog)
        .set({
          ...fields,
          revision: input.revision + 1,
          updatedAt: new Date(),
        })
        .where(and(eq(releaseLog.id, id), eq(releaseLog.revision, input.revision)))
        .run().changes
    )
      throw new AdminBusinessError("VERSION_CONFLICT", "更新日志版本已变化，请重新载入后核对。");
    return serialize(tx.select().from(releaseLog).where(eq(releaseLog.id, id)).get()!);
  });
}
