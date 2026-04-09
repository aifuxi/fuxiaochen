import { ArticleStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createArticleHandler } from "@/lib/article/article-handler";
import type { ArticleService } from "@/lib/article/article-service";

const sampleArticle = {
  archivedAt: null,
  category: {
    color: "#10B981",
    id: "category_1",
    name: "Design Systems",
    slug: "design-systems",
  },
  categoryId: "category_1",
  commentCount: 0,
  contentHtml: "<p>Hello</p>",
  contentMarkdown: "Hello",
  coverAssetId: null,
  createdAt: "2026-04-09T00:00:00.000Z",
  excerpt: "Intro",
  id: "article_1",
  isFeatured: false,
  likeCount: 0,
  publishedAt: null,
  readingTimeMinutes: 4,
  seoDescription: null,
  seoTitle: null,
  slug: "building-a-calm-cms",
  status: ArticleStatus.Draft,
  tagIds: ["tag_1"],
  tags: [
    {
      id: "tag_1",
      name: "Architecture",
      slug: "architecture",
    },
  ],
  title: "Building a calm CMS",
  updatedAt: "2026-04-09T00:00:00.000Z",
  viewCount: 0,
};

function createServiceStub(overrides: Partial<ArticleService> = {}): ArticleService {
  return {
    createArticle: async () => sampleArticle,
    deleteArticle: async (id) => ({ id }),
    getArticleById: async () => sampleArticle,
    listArticles: async () => ({
      items: [sampleArticle],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateArticle: async () => sampleArticle,
    ...overrides,
  };
}

describe("article handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createArticleHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listArticles(request));
    const response = await route(new Request("http://localhost/api/articles"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createArticleHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listArticles(request));
    const response = await route(new Request("http://localhost/api/articles?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleArticle],
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
    const handler = createArticleHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createArticle(request));
    const response = await route(
      new Request("http://localhost/api/articles", {
        body: JSON.stringify({
          isFeatured: false,
          slug: "building-a-calm-cms",
          status: ArticleStatus.Draft,
          title: "Building a calm CMS",
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
      data: sampleArticle,
      success: true,
    });
  });

  test("returns updated article on patch", async () => {
    const handler = createArticleHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateArticle(request, { id: "article_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/articles/article_1", {
        body: JSON.stringify({
          title: "Building a calmer CMS",
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
      data: sampleArticle,
      success: true,
    });
  });

  test("returns deleted article id on delete", async () => {
    const handler = createArticleHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteArticle(request, { id: "article_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/articles/article_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "article_1",
      },
      success: true,
    });
  });
});
