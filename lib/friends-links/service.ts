import "server-only";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { AdminBusinessError, authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import {
  friendSchema,
  type FriendQuery,
  type CreateFriendInput,
  type UpdateFriendInput,
} from "./schema";
type Transaction = Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getDatabase>["orm"]["FriendLink"]["first"]>>
>;
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
async function detail(id: string, tx: Transaction) {
  const row = await tx.orm.FriendLink.where({ id }).first();
  if (!row) throw new AdminBusinessError("NOT_FOUND", "友链不存在，可能已被删除。");
  return serialize(row);
}
export async function listFriends(query: FriendQuery, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const db = getDatabase();
    let filtered = tx.orm.FriendLink.where({});
    if (query.category) filtered = filtered.where({ category: query.category });
    if (query.status) filtered = filtered.where({ status: query.status });
    if (query.enabled) filtered = filtered.where({ enabled: query.enabled === "true" ? 1 : 0 });
    if (query.q)
      filtered = filtered.where((f) =>
        db.raw
          .sql`(instr(lower(${f.name}), lower(${query.q})) > 0 OR instr(lower(${f.url}), lower(${query.q})) > 0 OR instr(lower(${f.description}), lower(${query.q})) > 0)`
          .returns("sqlite/integer@1")
          .buildAst(),
      );
    const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const direction = query.sortDirection ?? "asc";
    const rows = await filtered
      .orderBy([
        (f) => {
          if (query.sortBy === "name") return f.name[direction]();
          if (query.sortBy === "category") return f.category[direction]();
          if (query.sortBy === "status")
            return f.status[direction]().withExpr(
              db.raw.sql`CASE ${f.status} WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END`
                .returns("sqlite/integer@1")
                .buildAst(),
            );
          return f.createdAt.desc();
        },
        (f) => f.id.desc(),
      ])
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    return { items: rows.map(serialize), total, page, pageCount, pageSize: query.pageSize };
  });
}
export async function getFriend(id: string, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    return detail(id, tx);
  });
}
export async function createFriend(input: CreateFriendInput, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const now = new Date();
    return serialize(
      await tx.orm.FriendLink.create({
        ...input,
        id: randomUUID(),
        status: "pending",
        enabled: Number(input.enabled),
        version: 1,
        createdAt: now,
        updatedAt: now,
      }),
    );
  });
}
export async function updateFriend(id: string, input: UpdateFriendInput, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    await detail(id, tx);
    const { version, ...fields } = input;
    if (
      !(await tx.orm.FriendLink.where({ id, version }).updateAndCount({
        ...fields,
        enabled: Number(input.enabled),
        version: version + 1,
        updatedAt: new Date(),
      }))
    )
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "友链已被其他页面修改，请重新载入后确认操作。草稿已保留。",
      );
    return detail(id, tx);
  });
}
export async function deleteFriend(id: string, version: number, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    await detail(id, tx);
    if (!(await tx.orm.FriendLink.where({ id, version }).deleteAndCount()))
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "友链已被其他页面修改，请重新载入后再次确认删除。",
      );
    return { id };
  });
}
