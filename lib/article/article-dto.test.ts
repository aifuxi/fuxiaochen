import { ArticleStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import {
  articleIdSchema,
  createArticleBodySchema,
  listArticlesQuerySchema,
  updateArticleBodySchema,
} from "@/lib/article/article-dto";

describe("article dto", () => {
  test("rejects an empty article id", () => {
    const result = articleIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listArticlesQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
    });

    expect(result.success).toBe(false);
  });

  test("requires slug when creating an article", () => {
    const result = createArticleBodySchema.safeParse({
      title: "Building a calm CMS",
    });

    expect(result.success).toBe(false);
  });

  test("accepts article status and de-duplicates tag ids", () => {
    const result = createArticleBodySchema.safeParse({
      slug: "building-a-calm-cms",
      status: ArticleStatus.Published,
      tagIds: ["tag_1", "tag_1", "tag_2"],
      title: "Building a calm CMS",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.tagIds).toEqual(["tag_1", "tag_2"]);
    }
  });

  test("requires at least one field when updating an article", () => {
    const result = updateArticleBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
