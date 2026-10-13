import "server-only";
import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";
import { z } from "zod";

import { writeTransaction, type DatabaseTransaction } from "@/lib/database";
import { category, friendLink, post, postTag, releaseLog, tag } from "@/lib/database/schema";
import { postExcerpt } from "@/lib/posts/excerpt";
import { slugSchema } from "@/lib/posts/schema";
import { getPublicSettings } from "@/lib/settings/service";

import { publicPostQuerySchema, type SearchParams, singleParams } from "./schema";

const postItems = (db: DatabaseTransaction) =>
  db
    .select({
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      categoryId: post.categoryId,
      category: { id: category.id, name: category.name, color: category.color },
    })
    .from(post)
    .leftJoin(category, eq(post.categoryId, category.id));
type PostRow = ReturnType<ReturnType<typeof postItems>["all"]>[number];
function tagsForPosts(tx: DatabaseTransaction, ids: string[]) {
  const byPost = new Map<string, { id: string; name: string }[]>();
  if (!ids.length) return byPost;
  for (const { postId, ...item } of tx
    .select({ postId: postTag.postId, id: tag.id, name: tag.name })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(inArray(postTag.postId, ids))
    .all()) {
    const tags = byPost.get(postId) ?? [];
    tags.push(item);
    byPost.set(postId, tags);
  }
  return byPost;
}
function serializePost(
  { publishedAt, updatedAt, ...row }: PostRow,
  tags: { id: string; name: string }[],
) {
  if (!row.slug || !row.category || !row.categoryId) throw new Error("已发布文章缺少必要字段");
  return {
    ...row,
    slug: row.slug,
    categoryId: row.categoryId,
    category: row.category,
    isFeatured: row.isFeatured === 1,
    publishedAt: publishedAt?.toISOString() ?? null,
    updatedAt: updatedAt.toISOString(),
    tags: tags.toSorted((a, b) => a.name.localeCompare(b.name)),
  };
}
export const getPublicTaxonomies = cache(async () => {
  await connection();
  return writeTransaction((tx) => {
    const categories = tx
      .select({ id: category.id, name: category.name, color: category.color })
      .from(category)
      .orderBy(asc(category.name))
      .all();
    const categoryCounts = tx
      .select({ categoryId: post.categoryId, count: count() })
      .from(post)
      .where(eq(post.status, "published"))
      .groupBy(post.categoryId)
      .all();
    const tags = tx.select({ id: tag.id, name: tag.name }).from(tag).orderBy(asc(tag.name)).all();
    const tagCounts = tx
      .select({ tagId: postTag.tagId, count: count() })
      .from(postTag)
      .innerJoin(post, eq(postTag.postId, post.id))
      .where(eq(post.status, "published"))
      .groupBy(postTag.tagId)
      .all();
    return {
      categories: categories
        .map((item) => ({
          ...item,
          count: categoryCounts.find((c) => c.categoryId === item.id)?.count ?? 0,
        }))
        .filter((c) => c.count > 0),
      tags: tags
        .map((item) => ({ ...item, count: tagCounts.find((t) => t.tagId === item.id)?.count ?? 0 }))
        .filter((t) => t.count > 0),
    };
  });
});
export async function listPublicPosts(params: SearchParams) {
  const parsed = publicPostQuerySchema.safeParse(
    Object.fromEntries(Object.entries(singleParams(params)).filter(([, value]) => value !== "")),
  );
  if (!parsed.success) return { error: "筛选参数无效，请清除筛选后重试。" } as const;
  return listPosts(JSON.stringify(parsed.data));
}
const listPosts = cache(async (queryKey: string) => {
  const query = publicPostQuerySchema.parse(JSON.parse(queryKey));
  const settings = await getPublicSettings();
  return writeTransaction((tx) => {
    const filters: SQL[] = [eq(post.status, "published")];
    if (query.categoryId) filters.push(eq(post.categoryId, query.categoryId));
    if (query.tagId)
      filters.push(
        sql`EXISTS (SELECT 1 FROM post_tag pt WHERE pt."postId" = ${post.id} AND pt."tagId" = ${query.tagId})`,
      );
    if (query.q)
      // 查询值仍按字面匹配；JSON 正文的链接、图片 URL 不进入文字搜索。
      filters.push(sql`(
        instr(lower(${post.title}), lower(${query.q})) > 0 OR
        instr(lower(${post.summary}), lower(${query.q})) > 0 OR
        instr(lower(json_extract(${post.content}, '$.text')), lower(${query.q})) > 0 OR
        EXISTS (SELECT 1 FROM category c WHERE c.id = ${post.categoryId} AND instr(lower(c.name), lower(${query.q})) > 0) OR
        EXISTS (SELECT 1 FROM post_tag pt JOIN tag t ON t.id = pt."tagId" WHERE pt."postId" = ${post.id} AND instr(lower(t.name), lower(${query.q})) > 0)
      )`);
    const where = and(...filters);
    const total = tx.select({ total: count() }).from(post).where(where).get()!.total;
    const pageCount = Math.max(1, Math.ceil(total / settings.postsPerPage));
    const page = Math.min(query.page, pageCount);
    const rows = postItems(tx)
      .where(where)
      .orderBy(desc(sql`${post.publishedAt} IS NULL`), desc(post.publishedAt), desc(post.id))
      .offset((page - 1) * settings.postsPerPage)
      .limit(settings.postsPerPage)
      .all();
    const emptyIds = rows.filter((row) => !row.summary.trim()).map((row) => row.id);
    const bodies = emptyIds.length
      ? tx
          .select({ id: post.id, content: post.content })
          .from(post)
          .where(and(eq(post.status, "published"), inArray(post.id, emptyIds)))
          .all()
      : [];
    const excerpts = new Map(bodies.map((body) => [body.id, postExcerpt("", body.content, 100)]));
    const tags = tagsForPosts(
      tx,
      rows.map((row) => row.id),
    );
    const items = rows.map((row) => ({
      ...serializePost(row, tags.get(row.id) ?? []),
      summary: row.summary.trim() || excerpts.get(row.id) || "",
    }));
    return { error: null, items, total, page, pageCount, query };
  });
});
export const getPublicPost = cache(async (slug: string) => {
  await connection();
  if (!slugSchema.safeParse(slug).success) return null;
  return writeTransaction((tx) => {
    const row = postItems(tx)
      .where(and(eq(post.status, "published"), eq(post.slug, slug)))
      .get();
    if (!row) return null;
    const content = tx
      .select({ content: post.content })
      .from(post)
      .where(and(eq(post.id, row.id), eq(post.status, "published")))
      .get();
    return content
      ? {
          ...serializePost(row, tagsForPosts(tx, [row.id]).get(row.id) ?? []),
          content: content.content,
        }
      : null;
  });
});
export const listPublicFriends = cache(async (selectedCategory: string | undefined) => {
  await connection();
  return writeTransaction((tx) => {
    const rows = tx
      .select({
        id: friendLink.id,
        name: friendLink.name,
        url: friendLink.url,
        avatar: friendLink.avatar,
        description: friendLink.description,
        category: friendLink.category,
      })
      .from(friendLink)
      .where(and(eq(friendLink.status, "approved"), eq(friendLink.enabled, 1)))
      .orderBy(desc(friendLink.createdAt), desc(friendLink.id))
      .all();
    return {
      categories: [...new Set(rows.map((f) => f.category))].toSorted(),
      items: selectedCategory ? rows.filter((f) => f.category === selectedCategory) : rows,
    };
  });
});
export const listPublicChangelog = cache(async (requestedPage: number) => {
  await connection();
  return writeTransaction((tx) => {
    const total = tx
      .select({ total: count() })
      .from(releaseLog)
      .where(eq(releaseLog.status, "published"))
      .get()!.total;
    const pageCount = Math.max(1, Math.ceil(total / 8));
    const page = Math.min(requestedPage, pageCount);
    const rows = tx
      .select({
        id: releaseLog.id,
        version: releaseLog.version,
        title: releaseLog.title,
        type: releaseLog.type,
        changes: releaseLog.changes,
        createdAt: releaseLog.createdAt,
      })
      .from(releaseLog)
      .where(eq(releaseLog.status, "published"))
      .orderBy(desc(releaseLog.createdAt), desc(releaseLog.id))
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
});
