import { ArticleStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import type { ApiError } from "@/lib/api/api-error";
import { articleErrorCodes } from "@/lib/api/error-codes";
import type { ArticleRepository } from "@/lib/article/article-repository";
import { createArticleService } from "@/lib/article/article-service";

const baseArticleRecord = {
  archivedAt: null,
  articleTags: [
    {
      tag: {
        id: "tag_1",
        name: "Architecture",
        slug: "architecture",
      },
    },
  ],
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
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
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
  title: "Building a calm CMS",
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
  viewCount: 0,
};

function createRepositoryStub(overrides: Partial<ArticleRepository> = {}): ArticleRepository {
  return {
    countByFilters: async () => 0,
    create: async (data) => ({
      ...baseArticleRecord,
      ...data,
      articleTags: (data.tagIds ?? []).map((tagId) => ({
        tag: {
          id: tagId,
          name: `Tag ${tagId}`,
          slug: `tag-${tagId}`,
        },
      })),
    }),
    delete: async () => undefined,
    findById: async () => baseArticleRecord,
    findBySlug: async () => null,
    findCategoryById: async () => ({ id: "category_1" }),
    findManyWithPagination: async () => [baseArticleRecord],
    findTagsByIds: async (ids) => ids.map((id) => ({ id })),
    update: async (_id, data) => ({
      ...baseArticleRecord,
      ...data,
      articleTags:
        data.tagIds !== undefined
          ? data.tagIds.map((tagId) => ({
              tag: {
                id: tagId,
                name: `Tag ${tagId}`,
                slug: `tag-${tagId}`,
              },
            }))
          : baseArticleRecord.articleTags,
    }),
    ...overrides,
  };
}

describe("article service", () => {
  test("returns ARTICLE_SLUG_CONFLICT when slug already exists on create", async () => {
    const service = createArticleService(
      createRepositoryStub({
        findBySlug: async () => baseArticleRecord,
      }),
    );

    await expect(
      service.createArticle({
        isFeatured: false,
        slug: "building-a-calm-cms",
        status: ArticleStatus.Draft,
        title: "Another title",
      }),
    ).rejects.toMatchObject({
      code: articleErrorCodes.ARTICLE_SLUG_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns ARTICLE_CATEGORY_NOT_FOUND when category does not exist", async () => {
    const service = createArticleService(
      createRepositoryStub({
        findCategoryById: async () => null,
      }),
    );

    await expect(
      service.createArticle({
        categoryId: "missing-category",
        isFeatured: false,
        slug: "missing-category-article",
        status: ArticleStatus.Draft,
        title: "Missing category article",
      }),
    ).rejects.toMatchObject({
      code: articleErrorCodes.ARTICLE_CATEGORY_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });

  test("returns ARTICLE_TAG_NOT_FOUND when a tag does not exist", async () => {
    const service = createArticleService(
      createRepositoryStub({
        findTagsByIds: async () => [{ id: "tag_1" }],
      }),
    );

    await expect(
      service.createArticle({
        isFeatured: false,
        slug: "missing-tag-article",
        status: ArticleStatus.Draft,
        tagIds: ["tag_1", "tag_2"],
        title: "Missing tag article",
      }),
    ).rejects.toMatchObject({
      code: articleErrorCodes.ARTICLE_TAG_NOT_FOUND,
      details: {
        ids: ["tag_2"],
      },
    } satisfies Partial<ApiError>);
  });

  test("returns ARTICLE_NOT_FOUND when article does not exist", async () => {
    const service = createArticleService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getArticleById("missing")).rejects.toMatchObject({
      code: articleErrorCodes.ARTICLE_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
