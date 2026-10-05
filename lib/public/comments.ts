import "server-only";
import { createHash, randomUUID } from "node:crypto";

import { getDatabase, writeTransaction } from "@/prisma/db";

import type { PublicCommentInput, PublicCommentList } from "./schema";

type Transaction = Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];
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
async function requirePost(id: string, tx: Transaction) {
  if (!(await tx.orm.public.Post.where({ id, status: "published" }).select("id").first()))
    throw new PublicCommentError("NOT_FOUND", "文章不存在或尚未发布。");
}
// 递归起点使用别名，避免内层 comment 表遮蔽外层 parentId 引用。
const visibleComments = (postId: string, tx: Transaction) =>
  tx.orm.public.Comment.where({ postId, status: "approved" }).where((c) =>
    getDatabase().raw.sql`NOT EXISTS (
    WITH RECURSIVE ancestors(id, "parentId", status) AS (
      SELECT seed.id, seed."parentId", seed.status FROM comment seed WHERE seed.id = ${c.parentId}
      UNION ALL
      SELECT p.id, p."parentId", p.status FROM comment p JOIN ancestors a ON p.id = a."parentId"
    ) SELECT 1 FROM ancestors WHERE status <> 'approved'
  )`
      .returns("pg/bool@1")
      .buildAst(),
  );
export async function listPublicComments(
  postId: string,
  requestedPage: number,
): Promise<PublicCommentList> {
  return writeTransaction(async (tx) => {
    await requirePost(postId, tx);
    const filtered = visibleComments(postId, tx);
    const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
    const pageSize = 20;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const rows = await filtered
      .select("id", "author", "content", "authorKind", "createdAt")
      .include("parent", (parent) => parent.select("id", "author"))
      .orderBy([(c) => c.createdAt.asc(), (c) => c.id.asc()])
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
  const result = await writeTransaction(async (tx) => {
    const previous = await tx.orm.public.Comment.where({ submissionId: input.submissionId })
      .select("submissionHash")
      .first();
    if (previous) {
      if (previous.submissionHash !== hash)
        throw new PublicCommentError("SUBMISSION_CONFLICT", "提交标识已用于其他内容，请重新提交。");
      return { retryAfter: 0 };
    }
    await requirePost(postId, tx);
    const settings = await tx.orm.public.SiteSetting.where({ id: 1 })
      .select("enableComments")
      .first();
    if (settings && !settings.enableComments)
      throw new PublicCommentError("COMMENTS_CLOSED", "评论已关闭，暂时不能提交新评论或回复。");
    let parentId = input.parentId;
    let depth = 0;
    while (parentId) {
      const parent = await tx.orm.public.Comment.where({ id: parentId, postId, status: "approved" })
        .select("parentId")
        .first();
      if (!parent || ++depth >= 16)
        throw new PublicCommentError(
          "INVALID_PARENT",
          "回复对象不可用或层级过深，请刷新评论后选择更上级的评论。",
        );
      parentId = parent.parentId;
    }
    const now = Date.now();
    await tx.orm.public.CommentRateLimit.where((r) =>
      getDatabase().raw.sql`${r.expiresAt} <= ${new Date(now).toISOString()}`
        .returns("pg/bool@1")
        .buildAst(),
    ).deleteAndCount();
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
      const existing = await tx.orm.public.CommentRateLimit.where({ id: limit.id }).first();
      const count = existing?.window === window ? existing.count : 0;
      if (count >= limit.max)
        return { retryAfter: Math.max(1, Math.ceil(((window + 1) * limit.duration - now) / 1000)) };
      entries.push({
        ...limit,
        window,
        count,
        existing,
        expiresAt: new Date((window + 1) * limit.duration),
      });
    }
    for (const entry of entries) {
      const data = { window: entry.window, count: entry.count + 1, expiresAt: entry.expiresAt };
      if (entry.existing)
        await tx.orm.public.CommentRateLimit.where({ id: entry.id }).updateAndCount(data);
      else await tx.orm.public.CommentRateLimit.create({ id: entry.id, ...data });
    }
    const { submissionId, ...data } = input;
    await tx.orm.public.Comment.create({
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
    });
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
