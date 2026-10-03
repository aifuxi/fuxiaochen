import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { z } from "zod";

import { slugSchema } from "@/lib/posts/schema";
import { getPublicSettings } from "@/lib/settings/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import { publicPostQuerySchema, type SearchParams, singleParams } from "./schema";

type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
const postItems = (db: Transaction) =>
  db.orm.Post.where({ status: "published" })
    .select("id", "slug", "title", "publishedAt", "updatedAt", "categoryId")
    .include("category", (category) => category.select("id", "name", "color"))
    .include("tagLinks", (links) => links.include("tag", (tag) => tag.select("id", "name")));
type PostRow = NonNullable<Awaited<ReturnType<ReturnType<typeof postItems>["first"]>>>;
function serializePost({ tagLinks, publishedAt, updatedAt, ...row }: PostRow) {
  return {
    ...row,
    publishedAt: publishedAt?.toISOString() ?? null,
    updatedAt: updatedAt.toISOString(),
    tags: tagLinks
      .map(({ tag }) => tag)
      .filter((tag) => tag !== null)
      .toSorted((a, b) => a.name.localeCompare(b.name)),
  };
}
export async function getPublicTaxonomies() {
  await connection();
  return writeTransaction(async (tx) => {
    const categories = await tx.orm.Category.select("id", "name", "color")
      .orderBy((c) => c.name.asc())
      .all();
    const categoryCounts = await tx.orm.Post.where({ status: "published" })
      .groupBy("categoryId")
      .aggregate((agg) => ({ count: agg.count() }));
    const tags = await tx.orm.Tag.select("id", "name")
      .orderBy((t) => t.name.asc())
      .all();
    const tagCounts = await tx.orm.PostTag.where((pt) =>
      getDatabase().raw
        .sql`EXISTS (SELECT 1 FROM post p WHERE p.id = ${pt.postId} AND p.status = 'published')`
        .returns("sqlite/integer@1")
        .buildAst(),
    )
      .groupBy("tagId")
      .aggregate((agg) => ({ count: agg.count() }));
    return {
      categories: categories
        .map((category) => ({
          ...category,
          count: categoryCounts.find((c) => c.categoryId === category.id)?.count ?? 0,
        }))
        .filter((c) => c.count > 0),
      tags: tags
        .map((tag) => ({ ...tag, count: tagCounts.find((t) => t.tagId === tag.id)?.count ?? 0 }))
        .filter((t) => t.count > 0),
    };
  });
}
export async function listPublicPosts(params: SearchParams) {
  const parsed = publicPostQuerySchema.safeParse(
    Object.fromEntries(Object.entries(singleParams(params)).filter(([, value]) => value !== "")),
  );
  if (!parsed.success) return { error: "筛选参数无效，请清除筛选后重试。" } as const;
  const query = parsed.data;
  const settings = await getPublicSettings();
  return writeTransaction(async (tx) => {
    const db = getDatabase();
    let filtered = postItems(tx);
    if (query.categoryId) filtered = filtered.where({ categoryId: query.categoryId });
    const tagId = query.tagId;
    if (tagId)
      filtered = filtered.where((p) =>
        db.raw
          .sql`EXISTS (SELECT 1 FROM post_tag pt WHERE pt.postId = ${p.id} AND pt.tagId = ${tagId})`
          .returns("sqlite/integer@1")
          .buildAst(),
      );
    if (query.q)
      filtered = filtered.where((p) =>
        db.raw.sql`(
      instr(lower(${p.title}), lower(${query.q})) > 0 OR
      instr(lower((SELECT json_extract(body.content, '$.text') FROM post body WHERE body.id = ${p.id})), lower(${query.q})) > 0 OR
      EXISTS (SELECT 1 FROM category c WHERE c.id = ${p.categoryId} AND instr(lower(c.name), lower(${query.q})) > 0) OR
      EXISTS (SELECT 1 FROM post_tag pt JOIN tag t ON t.id = pt.tagId WHERE pt.postId = ${p.id} AND instr(lower(t.name), lower(${query.q})) > 0)
    )`
          .returns("sqlite/integer@1")
          .buildAst(),
      );
    const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
    const pageCount = Math.max(1, Math.ceil(total / settings.postsPerPage));
    const page = Math.min(query.page, pageCount);
    const rows = await filtered
      .orderBy([(p) => p.publishedAt.desc(), (p) => p.id.desc()])
      .offset((page - 1) * settings.postsPerPage)
      .limit(settings.postsPerPage)
      .all();
    return { error: null, items: rows.map(serializePost), total, page, pageCount, query };
  });
}
export const getPublicPost = cache(async (slug: string) => {
  await connection();
  if (!slugSchema.safeParse(slug).success) return null;
  return writeTransaction(async (tx) => {
    const row = await postItems(tx).where({ slug }).first();
    if (!row) return null;
    const content = await tx.orm.Post.where({ id: row.id, status: "published" })
      .select("content")
      .first();
    return content ? { ...serializePost(row), content: content.content } : null;
  });
});
export async function listPublicFriends(category: string | undefined) {
  await connection();
  return writeTransaction(async (tx) => {
    const rows = await tx.orm.FriendLink.where({ status: "approved", enabled: 1 })
      .select("id", "name", "url", "avatar", "description", "category")
      .orderBy([(f) => f.createdAt.desc(), (f) => f.id.desc()])
      .all();
    return {
      categories: [...new Set(rows.map((f) => f.category))].toSorted(),
      items: category ? rows.filter((f) => f.category === category) : rows,
    };
  });
}
export async function listPublicChangelog(page: number) {
  await connection();
  return writeTransaction(async (tx) => {
    const { total } = await tx.orm.ReleaseLog.aggregate((agg) => ({ total: agg.count() }));
    const pageCount = Math.max(1, Math.ceil(total / 8));
    page = Math.min(page, pageCount);
    const rows = await tx.orm.ReleaseLog.select(
      "id",
      "version",
      "title",
      "type",
      "changes",
      "createdAt",
    )
      .orderBy([(r) => r.createdAt.desc(), (r) => r.id.desc()])
      .offset((page - 1) * 8)
      .limit(8)
      .all();
    return {
      items: rows.map((row) => ({
        ...row,
        changes: z.array(z.string()).parse(JSON.parse(row.changes)),
        createdAt: row.createdAt.toISOString(),
      })),
      page,
      pageCount,
      total,
    };
  });
}
