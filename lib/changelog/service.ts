import "server-only";
import type { z } from "zod";

import { randomUUID } from "node:crypto";

import type { listQuerySchema } from "@/lib/admin/schema";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import { releaseSchema, type ReleaseInput } from "./schema";
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getDatabase>["orm"]["public"]["ReleaseLog"]["first"]>>
>;
function serialize(row: Row) {
  const { id, createdAt, changes, ...fields } = row;
  return {
    ...releaseSchema.parse({ ...fields, changes: JSON.parse(changes) }),
    id,
    createdAt: createdAt.toISOString(),
  };
}
export async function listReleases(query: z.infer<typeof listQuerySchema>, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const db = getDatabase();
    let filtered = tx.orm.public.ReleaseLog.where({});
    if (query.record) filtered = filtered.where({ id: query.record });
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
      }),
    );
  });
}
