import { CommentStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import type { ApiError } from "@/lib/api/api-error";
import { commentErrorCodes } from "@/lib/api/error-codes";
import type { CommentRepository } from "@/lib/comment/comment-repository";
import { createCommentService } from "@/lib/comment/comment-service";

const baseCommentRecord = {
  _count: {
    replies: 0,
  },
  approvedAt: null,
  article: {
    id: "article_1",
    slug: "building-a-calm-cms",
    title: "Building a calm CMS",
  },
  articleId: "article_1",
  authorAvatarColor: null,
  authorAvatarInitials: "LC",
  authorEmail: "lin@example.com",
  authorName: "Lin",
  body: "Nice article.",
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  id: "comment_1",
  parentCommentId: null,
  replyDepth: 0,
  status: CommentStatus.Pending,
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<CommentRepository> = {}): CommentRepository {
  return {
    countByFilters: async () => 0,
    create: async (data) => ({
      ...baseCommentRecord,
      ...data,
      articleId: data.articleId,
      parentCommentId: data.parentCommentId ?? null,
      replyDepth: data.replyDepth,
      status: data.status,
    }),
    delete: async () => undefined,
    findArticleById: async () => ({ id: "article_1" }),
    findById: async () => baseCommentRecord,
    findManyWithPagination: async () => [baseCommentRecord],
    findParentById: async () => ({
      articleId: "article_1",
      id: "comment_parent",
      replyDepth: 0,
    }),
    syncArticleCommentCount: async () => undefined,
    update: async (_id, data) => ({
      ...baseCommentRecord,
      ...data,
      articleId: data.articleId ?? baseCommentRecord.articleId,
      parentCommentId:
        data.parentCommentId !== undefined ? data.parentCommentId : baseCommentRecord.parentCommentId,
      replyDepth: data.replyDepth ?? baseCommentRecord.replyDepth,
      status: data.status ?? baseCommentRecord.status,
    }),
    ...overrides,
  };
}

describe("comment service", () => {
  test("returns COMMENT_ARTICLE_NOT_FOUND when article does not exist", async () => {
    const service = createCommentService(
      createRepositoryStub({
        findArticleById: async () => null,
      }),
    );

    await expect(
      service.createComment({
        articleId: "missing",
        authorName: "Lin",
        body: "Nice article.",
        status: CommentStatus.Pending,
      }),
    ).rejects.toMatchObject({
      code: commentErrorCodes.COMMENT_ARTICLE_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });

  test("returns COMMENT_PARENT_NOT_FOUND when parent comment does not exist", async () => {
    const service = createCommentService(
      createRepositoryStub({
        findParentById: async () => null,
      }),
    );

    await expect(
      service.createComment({
        articleId: "article_1",
        authorName: "Lin",
        body: "Reply",
        parentCommentId: "missing-parent",
        status: CommentStatus.Pending,
      }),
    ).rejects.toMatchObject({
      code: commentErrorCodes.COMMENT_PARENT_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });

  test("returns COMMENT_PARENT_ARTICLE_MISMATCH when parent belongs to another article", async () => {
    const service = createCommentService(
      createRepositoryStub({
        findParentById: async () => ({
          articleId: "article_2",
          id: "comment_parent",
          replyDepth: 0,
        }),
      }),
    );

    await expect(
      service.createComment({
        articleId: "article_1",
        authorName: "Lin",
        body: "Reply",
        parentCommentId: "comment_parent",
        status: CommentStatus.Pending,
      }),
    ).rejects.toMatchObject({
      code: commentErrorCodes.COMMENT_PARENT_ARTICLE_MISMATCH,
    } satisfies Partial<ApiError>);
  });

  test("returns COMMENT_NOT_FOUND when comment does not exist", async () => {
    const service = createCommentService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getCommentById("missing")).rejects.toMatchObject({
      code: commentErrorCodes.COMMENT_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
