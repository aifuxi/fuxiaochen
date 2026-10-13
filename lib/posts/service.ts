import "server-only";
import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/service";
import {
  getDatabase,
  writeTransaction,
  type Database,
  type DatabaseTransaction,
} from "@/lib/database";
import { category, post, postTag, tag } from "@/lib/database/schema";
import { MediaError } from "@/lib/media/error";
import { documentReferenceUrls } from "@/lib/media/reference-urls";
import { ensureNewMediaReferences } from "@/lib/media/references";

import type {
  FeaturedPostInput,
  PostCounts,
  PostInput,
  PostQuery,
  PostUpdateInput,
} from "./schema";

import { emptyPostCounts, postStatusSchema } from "./schema";

export class PostError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "INVALID_INPUT"
      | "VERSION_CONFLICT"
      | "SLUG_CONFLICT"
      | "SLUG_LOCKED",
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}
function authorize(actor: TaxonomyActor) {
  const admin = getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new PostError("UNAUTHORIZED", "登录已失效，请重新登录。");
}
const summaryColumns = {
  id: post.id,
  title: post.title,
  summary: post.summary,
  isFeatured: post.isFeatured,
  featuredOrder: post.featuredOrder,
  slug: post.slug,
  slugLockedAt: post.slugLockedAt,
  categoryId: post.categoryId,
  status: post.status,
  version: post.version,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  publishedAt: post.publishedAt,
  scheduledFor: post.scheduledFor,
  category: { id: category.id, name: category.name, color: category.color },
};
const summaries = (db: Database | DatabaseTransaction) =>
  db.select(summaryColumns).from(post).leftJoin(category, eq(post.categoryId, category.id));
type SummaryRow = ReturnType<ReturnType<typeof summaries>["all"]>[number];
type TagSummary = { id: string; name: string };
function tagsForPosts(db: Database | DatabaseTransaction, ids: string[]) {
  const byPost = new Map<string, TagSummary[]>();
  if (!ids.length) return byPost;
  const links = db
    .select({ postId: postTag.postId, id: tag.id, name: tag.name })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(inArray(postTag.postId, ids))
    .all();
  for (const { postId, ...item } of links) {
    const items = byPost.get(postId) ?? [];
    items.push(item);
    byPost.set(postId, items);
  }
  return byPost;
}
function serialize(row: SummaryRow, tags: TagSummary[]) {
  return {
    ...row,
    isFeatured: row.isFeatured === 1,
    status: postStatusSchema.parse(row.status),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    scheduledFor: row.scheduledFor?.toISOString() ?? null,
    slugLockedAt: row.slugLockedAt?.toISOString() ?? null,
    tags: tags.toSorted((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
  };
}
function serializeRows(db: Database | DatabaseTransaction, rows: SummaryRow[]) {
  const tags = tagsForPosts(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => serialize(row, tags.get(row.id) ?? []));
}
function counts(db: Database | DatabaseTransaction): PostCounts {
  const groups = db
    .select({ status: post.status, count: count() })
    .from(post)
    .groupBy(post.status)
    .all();
  const result = { ...emptyPostCounts };
  for (const group of groups) {
    result[postStatusSchema.parse(group.status)] = group.count;
    result.all += group.count;
  }
  return result;
}
export async function listPosts(query: PostQuery, actor: TaxonomyActor) {
  authorize(actor);
  const db = getDatabase();
  const filters: SQL[] = [];
  if (query.status) filters.push(eq(post.status, query.status));
  if (query.categoryId) filters.push(eq(post.categoryId, query.categoryId));
  if (query.featured !== "all")
    filters.push(eq(post.isFeatured, query.featured === "featured" ? 1 : 0));
  if (query.q) {
    // instr 按字面查找，% 和 _ 不作为通配符；正文只检索持久化的纯文本字段。
    filters.push(sql`(
      instr(lower(${post.title}), lower(${query.q})) > 0 OR
      instr(lower(${post.summary}), lower(${query.q})) > 0 OR
      instr(lower(json_extract(${post.content}, '$.text')), lower(${query.q})) > 0 OR
      EXISTS (SELECT 1 FROM category c WHERE c.id = ${post.categoryId} AND instr(lower(c.name), lower(${query.q})) > 0) OR
      EXISTS (SELECT 1 FROM post_tag pt JOIN tag t ON t.id = pt."tagId" WHERE pt."postId" = ${post.id} AND instr(lower(t.name), lower(${query.q})) > 0)
    )`);
  }
  const where = and(...filters);
  const total = db.select({ total: count() }).from(post).where(where).get()!.total;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const order = query.sortDirection === "desc" ? desc : asc;
  const ordering: SQL[] = [];
  if (query.sortBy === "title") ordering.push(order(post.title));
  else if (query.sortBy === "category") {
    // 保持原 PostgreSQL 排序的 NULL 位置：升序末尾、降序开头。
    ordering.push(order(sql`${category.name} IS NULL`), order(category.name));
  } else if (query.sortBy === "status")
    ordering.push(
      order(sql`CASE ${post.status} WHEN 'draft' THEN 0 WHEN 'published' THEN 1 ELSE 2 END`),
    );
  else if (query.sortBy === "time") {
    const time = sql`CASE WHEN ${post.status} = 'scheduled' THEN ${post.scheduledFor} ELSE coalesce(${post.publishedAt}, ${post.updatedAt}) END`;
    ordering.push(order(sql`${time} IS NULL`), order(time));
  } else ordering.push(desc(post.createdAt));
  ordering.push(desc(post.id));
  const rows = summaries(db)
    .where(where)
    .orderBy(...ordering)
    .offset((page - 1) * query.pageSize)
    .limit(query.pageSize)
    .all();
  return {
    items: serializeRows(db, rows),
    total,
    page,
    pageSize: query.pageSize,
    pageCount,
    statusCounts: counts(db),
  };
}
export async function getPostSummary(actor: TaxonomyActor) {
  authorize(actor);
  const db = getDatabase();
  const schedules = summaries(db)
    .where(eq(post.status, "scheduled"))
    .orderBy(asc(sql`${post.scheduledFor} IS NULL`), asc(post.scheduledFor), asc(post.id))
    .limit(5)
    .all();
  const recentDrafts = summaries(db)
    .where(eq(post.status, "draft"))
    .orderBy(desc(post.updatedAt), desc(post.id))
    .limit(3)
    .all();
  return {
    statusCounts: counts(db),
    schedules: serializeRows(db, schedules),
    recentDrafts: serializeRows(db, recentDrafts),
  };
}
function detail(id: string, db: Database | DatabaseTransaction) {
  const row = db
    .select({ ...summaryColumns, content: post.content })
    .from(post)
    .leftJoin(category, eq(post.categoryId, category.id))
    .where(eq(post.id, id))
    .get();
  if (!row) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
  const { content, ...summary } = row;
  return { ...serialize(summary, tagsForPosts(db, [id]).get(id) ?? []), content };
}
export async function getPost(id: string, actor: TaxonomyActor) {
  authorize(actor);
  return detail(id, getDatabase());
}
function validateMedia(content: string, tx: DatabaseTransaction, previous?: string) {
  try {
    ensureNewMediaReferences(
      tx,
      documentReferenceUrls(content),
      previous ? documentReferenceUrls(previous) : [],
    );
  } catch (error) {
    if (error instanceof MediaError)
      throw new PostError("INVALID_INPUT", error.message, { content: [error.message] });
    throw error;
  }
}
function validateRelations(input: PostInput | PostUpdateInput, tx: DatabaseTransaction) {
  if (
    input.categoryId &&
    !tx.select({ id: category.id }).from(category).where(eq(category.id, input.categoryId)).get()
  )
    throw new PostError("INVALID_INPUT", "所选分类不存在，请重新选择。");
  for (const id of input.tagIds)
    if (!tx.select({ id: tag.id }).from(tag).where(eq(tag.id, id)).get())
      throw new PostError("INVALID_INPUT", "所选标签不存在，请重新选择。");
}
function validateSlug(slug: string | null, tx: DatabaseTransaction, id?: string) {
  if (!slug) return;
  const existing = tx.select({ id: post.id }).from(post).where(eq(post.slug, slug)).get();
  if (existing && existing.id !== id)
    throw new PostError("SLUG_CONFLICT", "slug 已被其他文章使用。", {
      slug: ["请使用唯一的 slug。"],
    });
}
function publication(
  input: PostInput | PostUpdateInput,
  previous?: {
    status: string;
    scheduledFor: Date | null;
    publishedAt: Date | null;
    slugLockedAt: Date | null;
  },
) {
  const now = new Date();
  const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;
  if (
    input.status === "scheduled" &&
    scheduledFor &&
    scheduledFor <= now &&
    !(
      previous?.status === "scheduled" &&
      previous.scheduledFor?.getTime() === scheduledFor.getTime()
    )
  )
    throw new PostError("INVALID_INPUT", "请选择未来的发布时间（北京时间）。");
  return {
    scheduledFor,
    publishedAt: previous?.publishedAt ?? (input.status === "published" ? now : null),
    slugLockedAt: previous?.slugLockedAt ?? (input.status === "published" ? now : null),
    updatedAt: now,
  };
}
export async function createPost(input: PostInput, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    validateRelations(input, tx);
    validateSlug(input.slug, tx);
    validateMedia(input.content, tx);
    const { tagIds, isFeatured, ...data } = input;
    const dates = publication(input);
    const id = randomUUID();
    tx.insert(post)
      .values({
        ...data,
        isFeatured: isFeatured ? 1 : 0,
        ...dates,
        id,
        createdAt: dates.updatedAt,
        version: 1,
      })
      .run();
    for (const tagId of tagIds) tx.insert(postTag).values({ postId: id, tagId }).run();
    return detail(id, tx);
  });
}
export async function updatePost(id: string, input: PostUpdateInput, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    const previous = tx.select().from(post).where(eq(post.id, id)).get();
    if (!previous) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    if (previous.version !== input.version)
      throw new PostError(
        "VERSION_CONFLICT",
        "文章已被其他页面修改。当前草稿已保留，请重新载入最新内容。",
      );
    if (previous.slugLockedAt && previous.slug !== input.slug)
      throw new PostError("SLUG_LOCKED", "文章首次发布后不能修改 slug。", {
        slug: ["首次发布后 slug 已锁定。"],
      });
    validateRelations(input, tx);
    validateSlug(input.slug, tx, id);
    validateMedia(input.content, tx, previous.content);
    const { tagIds, version, summary, isFeatured, featuredOrder, ...data } = input;
    const updated = tx
      .update(post)
      .set({
        ...data,
        summary: summary ?? previous.summary,
        isFeatured: isFeatured === undefined ? previous.isFeatured : isFeatured ? 1 : 0,
        featuredOrder: featuredOrder ?? previous.featuredOrder,
        ...publication(input, previous),
        version: version + 1,
      })
      .where(and(eq(post.id, id), eq(post.version, version)))
      .run();
    if (!updated.changes)
      throw new PostError("VERSION_CONFLICT", "文章版本已变化，请重新载入最新内容。");
    tx.delete(postTag).where(eq(postTag.postId, id)).run();
    for (const tagId of tagIds) tx.insert(postTag).values({ postId: id, tagId }).run();
    return detail(id, tx);
  });
}
export async function updatePostFeatured(
  id: string,
  input: FeaturedPostInput,
  actor: TaxonomyActor,
) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    const previous = tx.select({ version: post.version }).from(post).where(eq(post.id, id)).get();
    if (!previous) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    if (
      previous.version !== input.version ||
      !tx
        .update(post)
        .set({
          isFeatured: input.isFeatured ? 1 : 0,
          updatedAt: new Date(),
          version: input.version + 1,
        })
        .where(and(eq(post.id, id), eq(post.version, input.version)))
        .run().changes
    )
      throw new PostError("VERSION_CONFLICT", "文章已被其他页面修改，请核对刷新后的列表再操作。");
    const row = summaries(tx).where(eq(post.id, id)).get();
    if (!row) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    return serialize(row, tagsForPosts(tx, [id]).get(id) ?? []);
  });
}
export async function deletePost(id: string, version: number, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    const previous = tx.select().from(post).where(eq(post.id, id)).get();
    if (!previous) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    if (
      previous.version !== version ||
      !tx
        .delete(post)
        .where(and(eq(post.id, id), eq(post.version, version)))
        .run().changes
    )
      throw new PostError("VERSION_CONFLICT", "文章已被其他页面修改，请重新确认最新文章后删除。");
    return { id };
  });
}
