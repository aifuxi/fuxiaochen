import "server-only";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

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
async function authorize(actor: TaxonomyActor) {
  const admin = await getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new PostError("UNAUTHORIZED", "登录已失效，请重新登录。");
}
type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
const summaries = (db: Database | Transaction) =>
  db.orm.Post.select(
    "id",
    "title",
    "summary",
    "isFeatured",
    "featuredOrder",
    "slug",
    "slugLockedAt",
    "categoryId",
    "status",
    "version",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "scheduledFor",
  )
    .include("category")
    .include("tagLinks", (links) => links.include("tag"));
type SummaryRow = NonNullable<Awaited<ReturnType<ReturnType<typeof summaries>["first"]>>>;
function serialize(row: SummaryRow) {
  const { tagLinks, ...post } = row;
  return {
    ...post,
    isFeatured: post.isFeatured === 1,
    category: { id: post.category.id, name: post.category.name, color: post.category.color },
    status: postStatusSchema.parse(post.status),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledFor: post.scheduledFor?.toISOString() ?? null,
    slugLockedAt: post.slugLockedAt?.toISOString() ?? null,
    tags: tagLinks
      .map(({ tag }) => ({ id: tag.id, name: tag.name }))
      .toSorted((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
  };
}
async function counts(db: Database | Transaction): Promise<PostCounts> {
  const groups = await db.orm.Post.groupBy("status").aggregate((agg) => ({ count: agg.count() }));
  const result = { ...emptyPostCounts };
  for (const group of groups) {
    result[postStatusSchema.parse(group.status)] = group.count;
    result.all += group.count;
  }
  return result;
}
export async function listPosts(query: PostQuery, actor: TaxonomyActor) {
  await authorize(actor);
  const db = getDatabase();
  let filtered = db.orm.Post.where({});
  if (query.status) filtered = filtered.where({ status: query.status });
  if (query.categoryId) filtered = filtered.where({ categoryId: query.categoryId });
  if (query.featured !== "all")
    filtered = filtered.where({ isFeatured: query.featured === "featured" ? 1 : 0 });
  if (query.q) {
    // instr 按字面查找，关键词中的 %、_ 不会被解释成 LIKE 通配符；所有值使用绑定参数。
    filtered = filtered.where((p) =>
      db.raw.sql`(
      instr(lower(${p.title}), lower(${query.q})) > 0 OR
      instr(lower(${p.summary}), lower(${query.q})) > 0 OR instr(lower(
        json_extract(${p.content}, '$.text')
      ), lower(${query.q})) > 0
      OR EXISTS (SELECT 1 FROM category c WHERE c.id = ${p.categoryId} AND instr(lower(c.name), lower(${query.q})) > 0)
      OR EXISTS (SELECT 1 FROM post_tag pt JOIN tag t ON t.id = pt.tagId WHERE pt.postId = ${p.id} AND instr(lower(t.name), lower(${query.q})) > 0)
    )`
        .returns("sqlite/integer@1")
        .buildAst(),
    );
  }
  const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const direction = query.sortDirection ?? "asc";
  const rows = await filtered
    .select(
      "id",
      "title",
      "summary",
      "isFeatured",
      "featuredOrder",
      "slug",
      "slugLockedAt",
      "categoryId",
      "status",
      "version",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "scheduledFor",
    )
    .include("category")
    .include("tagLinks", (links) => links.include("tag"))
    .orderBy([
      (p) => {
        if (query.sortBy === "title") return p.title[direction]();
        if (query.sortBy === "category") return p.category.name[direction]();
        const order = p.createdAt[direction]();
        if (query.sortBy === "status")
          return order.withExpr(
            db.raw.sql`CASE ${p.status} WHEN 'draft' THEN 0 WHEN 'published' THEN 1 ELSE 2 END`
              .returns("sqlite/integer@1")
              .buildAst(),
          );
        if (query.sortBy === "time")
          return order.withExpr(
            db.raw
              .sql`CASE WHEN ${p.status} = 'scheduled' THEN ${p.scheduledFor} ELSE coalesce(${p.publishedAt}, ${p.updatedAt}) END`
              .returns("sqlite/text@1")
              .buildAst(),
          );
        return p.createdAt.desc();
      },
      (p) => p.id.desc(),
    ])
    .offset((page - 1) * query.pageSize)
    .limit(query.pageSize)
    .all();
  return {
    items: rows.map(serialize),
    total,
    page,
    pageSize: query.pageSize,
    pageCount,
    statusCounts: await counts(db),
  };
}
export async function getPostSummary(actor: TaxonomyActor) {
  await authorize(actor);
  const db = getDatabase();
  const schedules = await summaries(db)
    .where({ status: "scheduled" })
    .orderBy([(p) => p.scheduledFor.asc(), (p) => p.id.asc()])
    .limit(5)
    .all();
  return { statusCounts: await counts(db), schedules: schedules.map(serialize) };
}
async function detail(id: string, db: Database | Transaction) {
  const post = await db.orm.Post.where({ id })
    .include("category")
    .include("tagLinks", (links) => links.include("tag"))
    .first();
  if (!post) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
  const { content, ...summary } = post;
  return { ...serialize(summary), content };
}
export async function getPost(id: string, actor: TaxonomyActor) {
  await authorize(actor);
  return detail(id, getDatabase());
}
async function validateRelations(input: PostInput | PostUpdateInput, tx: Transaction) {
  if (!(await tx.orm.Category.where({ id: input.categoryId }).first()))
    throw new PostError("INVALID_INPUT", "所选分类不存在，请重新选择。");
  for (const id of input.tagIds)
    if (!(await tx.orm.Tag.where({ id }).first()))
      throw new PostError("INVALID_INPUT", "所选标签不存在，请重新选择。");
}
async function validateSlug(slug: string, tx: Transaction, id?: string) {
  const existing = await tx.orm.Post.where({ slug }).select("id").first();
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
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    await validateRelations(input, tx);
    await validateSlug(input.slug, tx);
    const { tagIds, isFeatured, ...data } = input;
    const dates = publication(input);
    const id = randomUUID();
    await tx.orm.Post.create({
      ...data,
      isFeatured: isFeatured ? 1 : 0,
      ...dates,
      id,
      createdAt: dates.updatedAt,
      version: 1,
    });
    for (const tagId of tagIds) await tx.orm.PostTag.create({ postId: id, tagId });
    return detail(id, tx);
  });
}
export async function updatePost(id: string, input: PostUpdateInput, actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    const previous = await tx.orm.Post.where({ id }).first();
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
    await validateRelations(input, tx);
    await validateSlug(input.slug, tx, id);
    const { tagIds, version, summary, isFeatured, featuredOrder, ...data } = input;
    if (
      !(await tx.orm.Post.where({ id, version }).updateAndCount({
        ...data,
        summary: summary ?? previous.summary,
        isFeatured: isFeatured === undefined ? previous.isFeatured : isFeatured ? 1 : 0,
        featuredOrder: featuredOrder ?? previous.featuredOrder,
        ...publication(input, previous),
        version: version + 1,
      }))
    )
      throw new PostError("VERSION_CONFLICT", "文章版本已变化，请重新载入最新内容。");
    await tx.orm.PostTag.where({ postId: id }).deleteAndCount();
    for (const tagId of tagIds) await tx.orm.PostTag.create({ postId: id, tagId });
    return detail(id, tx);
  });
}
export async function updatePostFeatured(
  id: string,
  input: FeaturedPostInput,
  actor: TaxonomyActor,
) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    const previous = await tx.orm.Post.where({ id }).select("version").first();
    if (!previous) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    if (
      previous.version !== input.version ||
      !(await tx.orm.Post.where({ id, version: input.version }).updateAndCount({
        isFeatured: input.isFeatured ? 1 : 0,
        updatedAt: new Date(),
        version: input.version + 1,
      }))
    )
      throw new PostError("VERSION_CONFLICT", "文章已被其他页面修改，请核对刷新后的列表再操作。");
    const post = await summaries(tx).where({ id }).first();
    if (!post) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    return serialize(post);
  });
}
export async function deletePost(id: string, version: number, actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    const previous = await tx.orm.Post.where({ id }).first();
    if (!previous) throw new PostError("NOT_FOUND", "文章不存在，可能已被删除。");
    if (
      previous.version !== version ||
      !(await tx.orm.Post.where({ id, version }).deleteAndCount())
    )
      throw new PostError("VERSION_CONFLICT", "文章已被其他页面修改，请重新确认最新文章后删除。");
    return { id };
  });
}
