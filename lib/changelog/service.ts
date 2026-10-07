import "server-only";
import type { z } from "zod";

import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { AdminBusinessError, authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import {
  releaseSchema,
  releaseStatusSchema,
  type releaseQuerySchema,
  type ReleaseInput,
  type ReleaseUpdateInput,
  type ReleaseVisibilityInput,
} from "./schema";
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getDatabase>["orm"]["public"]["ReleaseLog"]["first"]>>
>;
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
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const db = getDatabase();
    let filtered = tx.orm.public.ReleaseLog.where({});
    if (query.record) filtered = filtered.where({ id: query.record });
    if (!query.record && query.status) filtered = filtered.where({ status: query.status });
    if (!query.record && query.q)
      filtered = filtered.where((r) =>
        db.raw
          .sql`(strpos(lower(${r.version}), lower(${query.q})) > 0 OR strpos(lower(${r.title}), lower(${query.q})) > 0 OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(${r.changes}::jsonb) AS changes_item(value) WHERE strpos(lower(value), lower(${query.q})) > 0))`
          .returns("pg/bool@1")
          .buildAst(),
      );
    const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = await filtered
      .orderBy([(r) => r.createdAt.desc(), (r) => r.id.desc()])
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    return { items: rows.map(serialize), total, page, pageCount, pageSize: query.pageSize };
  });
}
export async function createRelease(input: ReleaseInput, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    return serialize(
      await tx.orm.public.ReleaseLog.create({
        ...input,
        changes: JSON.stringify(input.changes),
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  });
}
export async function getRelease(id: string, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const row = await tx.orm.public.ReleaseLog.where({ id }).first();
    if (!row) throw new AdminBusinessError("NOT_FOUND", "更新日志不存在，可能已被删除。");
    return serialize(row);
  });
}
export async function updateRelease(
  id: string,
  input: ReleaseUpdateInput | ReleaseVisibilityInput,
  actor: TaxonomyActor,
) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const previous = await tx.orm.public.ReleaseLog.where({ id }).first();
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
      !(await tx.orm.public.ReleaseLog.where({ id, revision: input.revision }).updateAndCount({
        ...fields,
        revision: input.revision + 1,
        updatedAt: new Date(),
      }))
    )
      throw new AdminBusinessError("VERSION_CONFLICT", "更新日志版本已变化，请重新载入后核对。");
    return serialize((await tx.orm.public.ReleaseLog.where({ id }).first())!);
  });
}
