import { describe, expect, test } from "vitest";

describe("tag repository integration", () => {
  const databaseEnabled = Boolean(process.env.DATABASE_URL);
  const databaseTest = databaseEnabled ? test : test.skip;

  databaseTest("deleting a used tag cascades article tag relations and keeps the article", async () => {
    const [{ prisma }, { createTagRepository }] = await Promise.all([
      import("@/lib/db"),
      import("@/lib/tag/tag-repository"),
    ]);
    const repository = createTagRepository(prisma);
    const suffix = crypto.randomUUID();

    const article = await prisma.article.create({
      data: {
        slug: `tag-cascade-article-${suffix}`,
        title: `Tag Cascade Article ${suffix}`,
      },
    });
    const tag = await prisma.tag.create({
      data: {
        name: `Tag Cascade ${suffix}`,
        slug: `tag-cascade-${suffix}`,
      },
    });

    await prisma.articleTag.create({
      data: {
        articleId: article.id,
        tagId: tag.id,
      },
    });

    try {
      await repository.delete(tag.id);

      const deletedTag = await prisma.tag.findUnique({
        where: {
          id: tag.id,
        },
      });
      const remainingRelation = await prisma.articleTag.findUnique({
        where: {
          articleId_tagId: {
            articleId: article.id,
            tagId: tag.id,
          },
        },
      });
      const remainingArticle = await prisma.article.findUnique({
        where: {
          id: article.id,
        },
      });

      expect(deletedTag).toBeNull();
      expect(remainingRelation).toBeNull();
      expect(remainingArticle?.id).toBe(article.id);
    } finally {
      await prisma.article.delete({
        where: {
          id: article.id,
        },
      });
    }
  });
});
