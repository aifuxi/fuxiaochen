import { describe, expect, test } from "vitest";

describe("article repository integration", () => {
  const databaseEnabled = Boolean(process.env.DATABASE_URL);
  const databaseTest = databaseEnabled ? test : test.skip;

  databaseTest("updating an article with the same tag ids keeps relations without unique conflicts", async () => {
    const [{ prisma }, { ArticleStatus }, { createArticleRepository }] = await Promise.all([
      import("@/lib/db"),
      import("@/generated/prisma/enums"),
      import("@/lib/article/article-repository"),
    ]);
    const repository = createArticleRepository(prisma);
    const suffix = crypto.randomUUID();

    const category = await prisma.category.create({
      data: {
        name: `Article Repo Category ${suffix}`,
        slug: `article-repo-category-${suffix}`,
      },
    });
    const tag = await prisma.tag.create({
      data: {
        name: `Article Repo Tag ${suffix}`,
        slug: `article-repo-tag-${suffix}`,
      },
    });
    const article = await prisma.article.create({
      data: {
        categoryId: category.id,
        slug: `article-repo-${suffix}`,
        status: ArticleStatus.Draft,
        title: `Article Repo ${suffix}`,
      },
    });

    await prisma.articleTag.create({
      data: {
        articleId: article.id,
        tagId: tag.id,
      },
    });

    try {
      const updatedArticle = await repository.update(article.id, {
        excerpt: "Updated excerpt",
        status: ArticleStatus.Published,
        tagIds: [tag.id],
      });

      const articleTags = await prisma.articleTag.findMany({
        where: {
          articleId: article.id,
        },
      });

      expect(updatedArticle.excerpt).toBe("Updated excerpt");
      expect(updatedArticle.status).toBe(ArticleStatus.Published);
      expect(articleTags).toHaveLength(1);
      expect(articleTags[0]?.tagId).toBe(tag.id);
    } finally {
      await prisma.article.delete({
        where: {
          id: article.id,
        },
      });
      await prisma.tag.delete({
        where: {
          id: tag.id,
        },
      });
      await prisma.category.delete({
        where: {
          id: category.id,
        },
      });
    }
  });
});
