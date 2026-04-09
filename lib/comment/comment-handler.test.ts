import { CommentStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createCommentHandler } from "@/lib/comment/comment-handler";
import type { CommentService } from "@/lib/comment/comment-service";

const sampleComment = {
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
  createdAt: "2026-04-09T00:00:00.000Z",
  id: "comment_1",
  parentCommentId: null,
  repliesCount: 0,
  replyDepth: 0,
  status: CommentStatus.Pending,
  updatedAt: "2026-04-09T00:00:00.000Z",
};

function createServiceStub(overrides: Partial<CommentService> = {}): CommentService {
  return {
    createComment: async () => sampleComment,
    deleteComment: async (id) => ({ id }),
    getCommentById: async () => sampleComment,
    listComments: async () => ({
      items: [sampleComment],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateComment: async () => sampleComment,
    ...overrides,
  };
}

describe("comment handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createCommentHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listComments(request));
    const response = await route(new Request("http://localhost/api/comments"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createCommentHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listComments(request));
    const response = await route(new Request("http://localhost/api/comments?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleComment],
      },
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
      success: true,
    });
  });

  test("returns 201 on create", async () => {
    const handler = createCommentHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createComment(request));
    const response = await route(
      new Request("http://localhost/api/comments", {
        body: JSON.stringify({
          articleId: "article_1",
          authorName: "Lin",
          body: "Nice article.",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleComment,
      success: true,
    });
  });

  test("returns updated comment on patch", async () => {
    const handler = createCommentHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateComment(request, { id: "comment_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/comments/comment_1", {
        body: JSON.stringify({
          status: CommentStatus.Approved,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleComment,
      success: true,
    });
  });

  test("returns deleted comment id on delete", async () => {
    const handler = createCommentHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteComment(request, { id: "comment_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/comments/comment_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "comment_1",
      },
      success: true,
    });
  });
});
