import { FriendLinkStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { handleRoute } from "@/lib/api/handle-route";
import { createPublicContentHandler } from "@/lib/public/public-content-handler";
import type { PublicContentService } from "@/lib/public/public-content-service";

const sampleArticle = {
  category: null,
  commentCount: 0,
  coverImageAlt: null,
  coverImageUrl: null,
  excerpt: "Intro",
  id: "article_1",
  isFeatured: true,
  likeCount: 0,
  publishedAt: "2026-04-10T00:00:00.000Z",
  readTimeLabel: "4 min read",
  readingTimeMinutes: 4,
  slug: "published-article",
  tags: [],
  title: "Published article",
  viewCount: 0,
};

function createServiceStub(overrides: Partial<PublicContentService> = {}): PublicContentService {
  return {
    createFriendLinkApplication: async () => ({
      id: "application_1",
      status: FriendLinkStatus.Pending,
    }),
    getArticleBySlug: async () => ({
      article: {
        ...sampleArticle,
        contentHtml: null,
        contentMarkdown: "Hello",
        seoDescription: null,
        seoTitle: null,
      },
      relatedArticles: [],
    }),
    getSite: async () => ({
      articleCategories: [],
      projectStats: [],
      settings: {
        accentColor: null,
        blogDescription: null,
        blogName: "SuperBlog",
        blogUrl: "http://localhost:3000",
        contactEmail: null,
        defaultMetaDescription: null,
        defaultMetaTitle: null,
        languageCode: "en",
        logoAlt: null,
        logoUrl: null,
        theme: "dark",
        timezone: "Asia/Shanghai",
      },
      stats: [],
    }),
    listArticleSlugs: async () => [{ slug: "published-article" }],
    listArticles: async () => ({
      items: [sampleArticle],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    listChangelog: async () => ({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    }),
    listFriendLinks: async () => ({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    }),
    listProjects: async () => ({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    }),
    ...overrides,
  };
}

describe("public content handler", () => {
  test("returns public article list without requiring a session", async () => {
    const handler = createPublicContentHandler({
      service: createServiceStub(),
    });
    const route = handleRoute(async (request: Request) => handler.listArticles(request));
    const response = await route(new Request("http://localhost/api/public/articles?page=1&pageSize=10"));

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

  test("creates a pending friend link application", async () => {
    const handler = createPublicContentHandler({
      service: createServiceStub(),
    });
    const route = handleRoute(async (request: Request) => handler.createFriendLinkApplication(request));
    const response = await route(
      new Request("http://localhost/api/public/friend-link-applications", {
        body: JSON.stringify({
          siteDescription: "Independent writing about systems.",
          siteName: "Lin Studio",
          siteUrl: "https://example.com",
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
      data: {
        id: "application_1",
        status: FriendLinkStatus.Pending,
      },
      success: true,
    });
  });

  test("rejects invalid friend link application URLs", async () => {
    const handler = createPublicContentHandler({
      service: createServiceStub(),
    });
    const route = handleRoute(async (request: Request) => handler.createFriendLinkApplication(request));
    const response = await route(
      new Request("http://localhost/api/public/friend-link-applications", {
        body: JSON.stringify({
          siteDescription: "Independent writing about systems.",
          siteName: "Lin Studio",
          siteUrl: "not-a-url",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "VALIDATION_ERROR",
      success: false,
    });
  });
});
