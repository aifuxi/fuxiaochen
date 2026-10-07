import "server-only";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import type {
  CommentCounts,
  CommentInput,
  CommentQuery,
  ModerateCommentInput,
  ReplyCommentInput,
} from "./schema";

import { commentStatusSchema } from "./schema";

export class CommentError extends Error {
  constructor(
    public code: "UNAUTHORIZED" | "NOT_FOUND" | "INVALID_INPUT" | "VERSION_CONFLICT",
    message: string,
  ) {
    super(message);
  }
}
async function authorize(actor: TaxonomyActor) {
  const admin = await getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new CommentError("UNAUTHORIZED", "登录已失效，请重新登录。");
  return admin;
}
type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
const items = (db: Database | Transaction) =>
  db.orm.public.Comment.include("post", (post) => post.select("id", "title")).include(
    "parent",
    (parent) => parent.select("id", "author", "status"),
  );
type Row = NonNullable<Awaited<ReturnType<ReturnType<typeof items>["first"]>>>;
function serialize(row: Row) {
  const {
    post,
    parent,
    adminId: _adminId,
    authorKind,
    submissionId: _submissionId,
    submissionHash: _submissionHash,
    ...comment
  } = row;
  if (!post) throw new Error("评论的文章关联缺失");
  return {
    ...comment,
    postTitle: post.title,
    parent: parent ? { ...parent, status: commentStatusSchema.parse(parent.status) } : null,
    // 回复身份来自服务端关系；管理员被移除后仍保留历史身份。
    isAdmin: authorKind === "admin",
    status: commentStatusSchema.parse(comment.status),
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
async function counts(db: Database | Transaction): Promise<CommentCounts> {
  const groups = await db.orm.public.Comment.groupBy("status").aggregate((agg) => ({
    count: agg.count(),
  }));
  const result: CommentCounts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  for (const group of groups) {
    result[commentStatusSchema.parse(group.status)] = group.count;
    result.all += group.count;
  }
  return result;
}
export async function listComments(query: CommentQuery, actor: TaxonomyActor) {
  await authorize(actor);
  const db = getDatabase();
  // 读取快照共用事务队列，避免 SQLite 同步等待锁阻塞持锁请求。
  return writeTransaction(async (tx) => {
    await authorize(actor);
    let filtered = items(tx).where({});
    if (query.record) filtered = filtered.where({ id: query.record });
    if (!query.record && query.status) filtered = filtered.where({ status: query.status });
    if (!query.record && query.postId) filtered = filtered.where({ postId: query.postId });
    if (!query.record && query.q)
      filtered = filtered.where((c) =>
        db.raw.sql`(
      strpos(lower(${c.author}), lower(${query.q})) > 0 OR
      strpos(lower(coalesce(${c.email}, '')), lower(${query.q})) > 0 OR
      strpos(lower(${c.content}), lower(${query.q})) > 0 OR
      EXISTS (SELECT 1 FROM post p WHERE p.id = ${c.postId} AND strpos(lower(p.title), lower(${query.q})) > 0)
    )`
          .returns("pg/bool@1")
          .buildAst(),
      );
    const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const direction = query.sortDirection ?? "asc";
    const rows = await filtered
      .orderBy([
        (c) => {
          if (query.sortBy === "author") return c.author[direction]();
          if (query.sortBy === "createdAt") return c.createdAt[direction]();
          if (query.sortBy === "status")
            return c.status[direction]().withExpr(
              db.raw.sql`CASE ${c.status} WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END`
                .returns("pg/int8number@1")
                .buildAst(),
            );
          return c.createdAt.desc();
        },
        (c) => c.id.desc(),
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
      statusCounts: await counts(tx),
    };
  });
}
export async function getCommentSummary(actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    return {
      statusCounts: await counts(tx),
      pending: (
        await items(tx)
          .where({ status: "pending" })
          .orderBy([(c) => c.createdAt.desc(), (c) => c.id.desc()])
          .limit(5)
          .all()
      ).map(serialize),
    };
  });
}
async function detail(id: string, db: Database | Transaction) {
  const row = await items(db).where({ id }).first();
  if (!row) throw new CommentError("NOT_FOUND", "评论不存在，可能已随文章或父评论删除。");
  return serialize(row);
}
export async function getComment(id: string, actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    return detail(id, tx);
  });
}
async function current(id: string, version: number, tx: Transaction) {
  const row = await tx.orm.public.Comment.where({ id }).first();
  if (!row) throw new CommentError("NOT_FOUND", "评论不存在，可能已随文章或父评论删除。");
  if (row.version !== version)
    throw new CommentError(
      "VERSION_CONFLICT",
      "评论已被其他页面修改，请重新载入后确认操作。回复草稿已保留。",
    );
  return row;
}
async function approvedAncestors(parentId: string | null, tx: Transaction) {
  let depth = 0;
  while (parentId) {
    const parent = await tx.orm.public.Comment.where({ id: parentId }).first();
    if (!parent || parent.status !== "approved")
      throw new CommentError("INVALID_INPUT", "请先通过所有上级评论的审核。");
    parentId = parent.parentId;
    depth += 1;
  }
  return depth;
}
export async function createComment(input: CommentInput, actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    if (!(await tx.orm.public.Post.where({ id: input.postId }).first()))
      throw new CommentError("INVALID_INPUT", "所选文章不存在。");
    const id = randomUUID();
    const now = new Date();
    await tx.orm.public.Comment.create({
      ...input,
      id,
      parentId: null,
      adminId: null,
      authorKind: "reader",
      submissionId: null,
      submissionHash: null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
    return detail(id, tx);
  });
}
export async function moderateComment(
  id: string,
  input: ModerateCommentInput,
  actor: TaxonomyActor,
) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    const row = await current(id, input.version, tx);
    if (input.status === "approved") await approvedAncestors(row.parentId, tx);
    const now = new Date();
    if (
      !(await tx.orm.public.Comment.where({ id, version: input.version }).updateAndCount({
        status: input.status,
        version: input.version + 1,
        updatedAt: now,
      }))
    )
      throw new CommentError("VERSION_CONFLICT", "评论版本已变化，请重新载入。");
    if (input.status === "rejected") {
      // 回复只能指向已存在的评论，关系不允许修改，无法通过 API 建立环。
      const queue = [id];
      for (let index = 0; index < queue.length; index += 1) {
        const parentId = queue[index];
        const children = await tx.orm.public.Comment.where({ parentId })
          .select("id", "version")
          .all();
        for (const child of children) {
          await tx.orm.public.Comment.where({ id: child.id }).updateAndCount({
            status: "rejected",
            version: child.version + 1,
            updatedAt: now,
          });
          queue.push(child.id);
        }
      }
    }
    return detail(id, tx);
  });
}
export async function replyComment(id: string, input: ReplyCommentInput, actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    const admin = await authorize(actor);
    const parent = await current(id, input.version, tx);
    const depth = await approvedAncestors(id, tx);
    if (depth >= 16)
      throw new CommentError("INVALID_INPUT", "回复最多支持 16 层，请回复更上级的评论。");
    // 同一版本只能提交一次回复，响应丢失后重试不会重复创建。
    const now = new Date();
    if (
      !(await tx.orm.public.Comment.where({ id, version: input.version }).updateAndCount({
        version: input.version + 1,
        updatedAt: now,
      }))
    )
      throw new CommentError("VERSION_CONFLICT", "评论版本已变化，请重新载入。");
    const replyId = randomUUID();
    await tx.orm.public.Comment.create({
      id: replyId,
      postId: parent.postId,
      parentId: id,
      adminId: admin.adminId,
      authorKind: "admin",
      submissionId: null,
      submissionHash: null,
      author: admin.username,
      email: null,
      content: input.content,
      status: "approved",
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
    return detail(replyId, tx);
  });
}
export async function deleteComment(id: string, version: number, actor: TaxonomyActor) {
  await authorize(actor);
  return writeTransaction(async (tx) => {
    await authorize(actor);
    await current(id, version, tx);
    if (!(await tx.orm.public.Comment.where({ id, version }).deleteAndCount()))
      throw new CommentError("VERSION_CONFLICT", "评论版本已变化，请重新载入。");
    return { id };
  });
}
