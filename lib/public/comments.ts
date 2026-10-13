import "server-only";
import { and, asc, count, eq, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { createHash, randomUUID } from "node:crypto";

import { writeTransaction, type DatabaseTransaction } from "@/lib/database";
import { comment, commentRateLimit, post, siteSetting } from "@/lib/database/schema";

import type { PublicCommentInput, PublicCommentList } from "./schema";

export class PublicCommentError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "COMMENTS_CLOSED"
      | "INVALID_PARENT"
      | "SUBMISSION_CONFLICT"
      | "RATE_LIMITED",
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
function requirePost(id: string, tx: DatabaseTransaction) {
  if (
    !tx
      .select({ id: post.id })
      .from(post)
      .where(and(eq(post.id, id), eq(post.status, "published")))
      .get()
  )
    throw new PublicCommentError("NOT_FOUND", "文章不存在或尚未发布。");
}
// 递归起点使用别名，避免内层 comment 表遮蔽外层 parentId 引用。
const visibleComments = (postId: string) =>
  and(
    eq(comment.postId, postId),
    eq(comment.status, "approved"),
    sql`NOT EXISTS (
      WITH RECURSIVE ancestors(id, "parentId", status) AS (
        SELECT seed.id, seed."parentId", seed.status FROM comment seed WHERE seed.id = ${comment.parentId}
        UNION ALL
        SELECT p.id, p."parentId", p.status FROM comment p JOIN ancestors a ON p.id = a."parentId"
      ) SELECT 1 FROM ancestors WHERE status <> 'approved'
    )`,
  );
const parentComment = alias(comment, "parent_comment");
export async function listPublicComments(
  postId: string,
  requestedPage: number,
): Promise<PublicCommentList> {
  return writeTransaction((tx) => {
    requirePost(postId, tx);
    const where = visibleComments(postId);
    const total = tx.select({ total: count() }).from(comment).where(where).get()!.total;
    const pageSize = 20;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const rows = tx
      .select({
        id: comment.id,
        author: comment.author,
        content: comment.content,
        authorKind: comment.authorKind,
        createdAt: comment.createdAt,
        parent: { id: parentComment.id, author: parentComment.author },
      })
      .from(comment)
      .leftJoin(parentComment, eq(comment.parentId, parentComment.id))
      .where(where)
      .orderBy(asc(comment.createdAt), asc(comment.id))
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .all();
    return {
      items: rows.map(({ authorKind, createdAt, ...row }) => ({
        ...row,
        isAdmin: authorKind === "admin",
        createdAt: createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      pageCount,
    };
  });
}
export async function submitPublicComment(postId: string, input: PublicCommentInput) {
  const hash = createHash("sha256")
    .update(JSON.stringify([postId, input.author, input.email, input.content, input.parentId]))
    .digest("hex");
  const result = writeTransaction((tx) => {
    const previous = tx
      .select({ submissionHash: comment.submissionHash })
      .from(comment)
      .where(eq(comment.submissionId, input.submissionId))
      .get();
    if (previous) {
      if (previous.submissionHash !== hash)
        throw new PublicCommentError("SUBMISSION_CONFLICT", "提交标识已用于其他内容，请重新提交。");
      return { retryAfter: 0 };
    }
    requirePost(postId, tx);
    const settings = tx
      .select({ enableComments: siteSetting.enableComments })
      .from(siteSetting)
      .where(eq(siteSetting.id, 1))
      .get();
    if (settings && !settings.enableComments)
      throw new PublicCommentError("COMMENTS_CLOSED", "评论已关闭，暂时不能提交新评论或回复。");
    let parentId = input.parentId;
    let depth = 0;
    while (parentId) {
      const parent = tx
        .select({ parentId: comment.parentId })
        .from(comment)
        .where(
          and(eq(comment.id, parentId), eq(comment.postId, postId), eq(comment.status, "approved")),
        )
        .get();
      if (!parent || ++depth >= 16)
        throw new PublicCommentError(
          "INVALID_PARENT",
          "回复对象不可用或层级过深，请刷新评论后选择更上级的评论。",
        );
      parentId = parent.parentId;
    }
    const now = Date.now();
    tx.delete(commentRateLimit)
      .where(lte(commentRateLimit.expiresAt, new Date(now)))
      .run();
    const limits = [
      { id: "global", duration: 60_000, max: 30 },
      {
        id: `email:${createHash("sha256").update(input.email).digest("hex")}`,
        duration: 600_000,
        max: 3,
      },
    ];
    const entries = [];
    for (const limit of limits) {
      const window = Math.floor(now / limit.duration);
      const existing = tx
        .select()
        .from(commentRateLimit)
        .where(eq(commentRateLimit.id, limit.id))
        .get();
      const attempts = existing?.window === window ? existing.count : 0;
      if (attempts >= limit.max)
        return { retryAfter: Math.max(1, Math.ceil(((window + 1) * limit.duration - now) / 1000)) };
      entries.push({
        ...limit,
        window,
        count: attempts,
        existing,
        expiresAt: new Date((window + 1) * limit.duration),
      });
    }
    for (const entry of entries) {
      const data = { window: entry.window, count: entry.count + 1, expiresAt: entry.expiresAt };
      if (entry.existing)
        tx.update(commentRateLimit).set(data).where(eq(commentRateLimit.id, entry.id)).run();
      else
        tx.insert(commentRateLimit)
          .values({ id: entry.id, ...data })
          .run();
    }
    const { submissionId, ...data } = input;
    tx.insert(comment)
      .values({
        ...data,
        id: randomUUID(),
        postId,
        submissionId,
        submissionHash: hash,
        authorKind: "reader",
        adminId: null,
        status: "pending",
        version: 1,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      })
      .run();
    return { retryAfter: 0 };
  });
  if (result.retryAfter)
    throw new PublicCommentError(
      "RATE_LIMITED",
      "评论提交过于频繁，请稍后重试。",
      result.retryAfter,
    );
  return { message: "已收到，等待审核。" };
}
