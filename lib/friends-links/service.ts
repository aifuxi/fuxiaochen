import "server-only";
import { and, asc, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { AdminBusinessError, authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction, type DatabaseTransaction } from "@/lib/database";
import { friendLink } from "@/lib/database/schema";
import { MediaError } from "@/lib/media/error";
import { friendReferenceUrls } from "@/lib/media/reference-urls";
import { ensureNewMediaReferences } from "@/lib/media/references";

import {
  friendSchema,
  type FriendQuery,
  type CreateFriendInput,
  type UpdateFriendInput,
} from "./schema";
type Row = typeof friendLink.$inferSelect;
function serialize(row: Row) {
  const { id, version, createdAt, updatedAt, ...fields } = row;
  return {
    ...friendSchema.parse({ ...fields, enabled: Boolean(row.enabled) }),
    id,
    version,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
function detail(id: string, tx: DatabaseTransaction) {
  const row = tx.select().from(friendLink).where(eq(friendLink.id, id)).get();
  if (!row) throw new AdminBusinessError("NOT_FOUND", "友链不存在，可能已被删除。");
  return serialize(row);
}
export async function listFriends(query: FriendQuery, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    const filters: SQL[] = [];
    if (query.record) filters.push(eq(friendLink.id, query.record));
    if (!query.record && query.category) filters.push(eq(friendLink.category, query.category));
    if (!query.record && query.status) filters.push(eq(friendLink.status, query.status));
    if (!query.record && query.enabled)
      filters.push(eq(friendLink.enabled, query.enabled === "true" ? 1 : 0));
    if (!query.record && query.q)
      filters.push(
        sql`(instr(lower(${friendLink.name}), lower(${query.q})) > 0 OR instr(lower(${friendLink.url}), lower(${query.q})) > 0 OR instr(lower(${friendLink.description}), lower(${query.q})) > 0)`,
      );
    const where = and(...filters);
    const total = tx.select({ total: count() }).from(friendLink).where(where).get()!.total;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const direction = query.sortDirection === "desc" ? desc : asc;
    let order = desc(friendLink.createdAt);
    if (query.sortBy === "name") order = direction(friendLink.name);
    if (query.sortBy === "category") order = direction(friendLink.category);
    if (query.sortBy === "status")
      order = direction(
        sql`CASE ${friendLink.status} WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END`,
      );
    const rows = tx
      .select()
      .from(friendLink)
      .where(where)
      .orderBy(order, desc(friendLink.id))
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    return { items: rows.map(serialize), total, page, pageCount, pageSize: query.pageSize };
  });
}
export async function getFriend(id: string, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    return detail(id, tx);
  });
}
export async function createFriend(input: CreateFriendInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    try {
      ensureNewMediaReferences(tx, friendReferenceUrls(input));
    } catch (error) {
      if (error instanceof MediaError) throw new AdminBusinessError("INVALID_INPUT", error.message);
      throw error;
    }
    const now = new Date();
    const id = randomUUID();
    tx.insert(friendLink)
      .values({
        ...input,
        id,
        status: "pending",
        enabled: Number(input.enabled),
        version: 1,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return detail(id, tx);
  });
}
export async function updateFriend(id: string, input: UpdateFriendInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    const previous = detail(id, tx);
    try {
      ensureNewMediaReferences(tx, friendReferenceUrls(input), friendReferenceUrls(previous));
    } catch (error) {
      if (error instanceof MediaError) throw new AdminBusinessError("INVALID_INPUT", error.message);
      throw error;
    }
    const { version, ...fields } = input;
    if (
      !tx
        .update(friendLink)
        .set({
          ...fields,
          enabled: Number(input.enabled),
          version: version + 1,
          updatedAt: new Date(),
        })
        .where(and(eq(friendLink.id, id), eq(friendLink.version, version)))
        .run().changes
    )
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "友链已被其他页面修改，请重新载入后确认操作。草稿已保留。",
      );
    return detail(id, tx);
  });
}
export async function deleteFriend(id: string, version: number, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    detail(id, tx);
    if (
      !tx
        .delete(friendLink)
        .where(and(eq(friendLink.id, id), eq(friendLink.version, version)))
        .run().changes
    )
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "友链已被其他页面修改，请重新载入后再次确认删除。",
      );
    return { id };
  });
}
