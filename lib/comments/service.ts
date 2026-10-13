import "server-only";
import { and, asc, count, desc, eq, getTableColumns, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/session-access";
import { writeTransaction, type Database, type DatabaseTransaction } from "@/lib/database";
import { comment, post } from "@/lib/database/schema";

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
function authorize(actor: TaxonomyActor) {
  const admin = getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new CommentError("UNAUTHORIZED", "登录已失效，请重新登录。");
  return admin;
}
const parentComment = alias(comment, "parent_comment");
const items = (db: Database | DatabaseTransaction) =>
  db
    .select({
      comment: getTableColumns(comment),
      post: { id: post.id, title: post.title },
      parent: { id: parentComment.id, author: parentComment.author, status: parentComment.status },
    })
    .from(comment)
    .innerJoin(post, eq(comment.postId, post.id))
    .leftJoin(parentComment, eq(comment.parentId, parentComment.id));
type Row = NonNullable<ReturnType<ReturnType<typeof items>["get"]>>;
function serialize(row: Row) {
  const {
    adminId: _adminId,
    authorKind,
    submissionId: _submissionId,
    submissionHash: _submissionHash,
    ...fields
  } = row.comment;
  return {
    ...fields,
    postTitle: row.post.title,
    parent: row.parent
      ? { ...row.parent, status: commentStatusSchema.parse(row.parent.status) }
      : null,
    // 回复身份来自服务端关系；管理员被移除后仍保留历史身份。
    isAdmin: authorKind === "admin",
    status: commentStatusSchema.parse(fields.status),
    createdAt: fields.createdAt.toISOString(),
    updatedAt: fields.updatedAt.toISOString(),
  };
}
function counts(db: Database | DatabaseTransaction): CommentCounts {
  const groups = db
    .select({ status: comment.status, count: count() })
    .from(comment)
    .groupBy(comment.status)
    .all();
  const result: CommentCounts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  for (const group of groups) {
    result[commentStatusSchema.parse(group.status)] = group.count;
    result.all += group.count;
  }
  return result;
}
export async function listComments(query: CommentQuery, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    const filters: SQL[] = [];
    if (query.record) filters.push(eq(comment.id, query.record));
    if (!query.record && query.status) filters.push(eq(comment.status, query.status));
    if (!query.record && query.postId) filters.push(eq(comment.postId, query.postId));
    if (!query.record && query.q)
      filters.push(sql`(
        instr(lower(${comment.author}), lower(${query.q})) > 0 OR
        instr(lower(coalesce(${comment.email}, '')), lower(${query.q})) > 0 OR
        instr(lower(${comment.content}), lower(${query.q})) > 0 OR
        EXISTS (SELECT 1 FROM post p WHERE p.id = ${comment.postId} AND instr(lower(p.title), lower(${query.q})) > 0)
      )`);
    const where = and(...filters);
    const total = tx.select({ total: count() }).from(comment).where(where).get()!.total;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const direction = query.sortDirection === "desc" ? desc : asc;
    let order = desc(comment.createdAt);
    if (query.sortBy === "author") order = direction(comment.author);
    if (query.sortBy === "createdAt") order = direction(comment.createdAt);
    if (query.sortBy === "status")
      order = direction(
        sql`CASE ${comment.status} WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END`,
      );
    const rows = items(tx)
      .where(where)
      .orderBy(order, desc(comment.id))
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    return {
      items: rows.map(serialize),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      statusCounts: counts(tx),
    };
  });
}
export async function getCommentSummary(actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    return {
      statusCounts: counts(tx),
      pending: items(tx)
        .where(eq(comment.status, "pending"))
        .orderBy(desc(comment.createdAt), desc(comment.id))
        .limit(5)
        .all()
        .map(serialize),
    };
  });
}
function detail(id: string, db: Database | DatabaseTransaction) {
  const row = items(db).where(eq(comment.id, id)).get();
  if (!row) throw new CommentError("NOT_FOUND", "评论不存在，可能已随文章或父评论删除。");
  return serialize(row);
}
export async function getComment(id: string, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    return detail(id, tx);
  });
}
function current(id: string, version: number, tx: DatabaseTransaction) {
  const row = tx.select().from(comment).where(eq(comment.id, id)).get();
  if (!row) throw new CommentError("NOT_FOUND", "评论不存在，可能已随文章或父评论删除。");
  if (row.version !== version)
    throw new CommentError(
      "VERSION_CONFLICT",
      "评论已被其他页面修改，请重新载入后确认操作。回复草稿已保留。",
    );
  return row;
}
function approvedAncestors(parentId: string | null, tx: DatabaseTransaction) {
  let depth = 0;
  while (parentId) {
    const parent = tx.select().from(comment).where(eq(comment.id, parentId)).get();
    if (!parent || parent.status !== "approved")
      throw new CommentError("INVALID_INPUT", "请先通过所有上级评论的审核。");
    parentId = parent.parentId;
    depth += 1;
  }
  return depth;
}
export async function createComment(input: CommentInput, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    if (!tx.select({ id: post.id }).from(post).where(eq(post.id, input.postId)).get())
      throw new CommentError("INVALID_INPUT", "所选文章不存在。");
    const id = randomUUID();
    const now = new Date();
    tx.insert(comment)
      .values({
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
      })
      .run();
    return detail(id, tx);
  });
}
export async function moderateComment(
  id: string,
  input: ModerateCommentInput,
  actor: TaxonomyActor,
) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    const row = current(id, input.version, tx);
    if (input.status === "approved") approvedAncestors(row.parentId, tx);
    const now = new Date();
    if (
      !tx
        .update(comment)
        .set({
          status: input.status,
          version: input.version + 1,
          updatedAt: now,
        })
        .where(and(eq(comment.id, id), eq(comment.version, input.version)))
        .run().changes
    )
      throw new CommentError("VERSION_CONFLICT", "评论版本已变化，请重新载入。");
    if (input.status === "rejected") {
      // 回复只能指向已存在的评论，关系不允许修改，无法通过 API 建立环。
      const queue = [id];
      for (let index = 0; index < queue.length; index += 1) {
        const children = tx
          .select({ id: comment.id, version: comment.version })
          .from(comment)
          .where(eq(comment.parentId, queue[index]))
          .all();
        for (const child of children) {
          tx.update(comment)
            .set({
              status: "rejected",
              version: child.version + 1,
              updatedAt: now,
            })
            .where(eq(comment.id, child.id))
            .run();
          queue.push(child.id);
        }
      }
    }
    return detail(id, tx);
  });
}
export async function replyComment(id: string, input: ReplyCommentInput, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    const admin = authorize(actor);
    const parent = current(id, input.version, tx);
    const depth = approvedAncestors(id, tx);
    if (depth >= 16)
      throw new CommentError("INVALID_INPUT", "回复最多支持 16 层，请回复更上级的评论。");
    // 同一版本只能提交一次回复，响应丢失后重试不会重复创建。
    const now = new Date();
    if (
      !tx
        .update(comment)
        .set({
          version: input.version + 1,
          updatedAt: now,
        })
        .where(and(eq(comment.id, id), eq(comment.version, input.version)))
        .run().changes
    )
      throw new CommentError("VERSION_CONFLICT", "评论版本已变化，请重新载入。");
    const replyId = randomUUID();
    tx.insert(comment)
      .values({
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
      })
      .run();
    return detail(replyId, tx);
  });
}
export async function deleteComment(id: string, version: number, actor: TaxonomyActor) {
  authorize(actor);
  return writeTransaction((tx) => {
    authorize(actor);
    current(id, version, tx);
    if (
      !tx
        .delete(comment)
        .where(and(eq(comment.id, id), eq(comment.version, version)))
        .run().changes
    )
      throw new CommentError("VERSION_CONFLICT", "评论版本已变化，请重新载入。");
    return { id };
  });
}
