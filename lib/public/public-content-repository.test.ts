import { describe, expect, test } from "vitest";

describe("public content repository integration", () => {
  const databaseEnabled = Boolean(process.env.DATABASE_URL);
  const databaseTest = databaseEnabled ? test : test.skip;

  databaseTest("only returns currently published articles, published projects, and approved friend links", async () => {
    const [{ prisma }, { ArticleStatus, FriendLinkStatus, ProjectCategory }, { createPublicContentRepository }] =
      await Promise.all([
        import("@/lib/db"),
        import("@/generated/prisma/enums"),
        import("@/lib/public/public-content-repository"),
      ]);
    const repository = createPublicContentRepository(prisma);
    const suffix = crypto.randomUUID();
    const now = new Date("2026-04-12T00:00:00.000Z");
    const past = new Date("2026-04-10T00:00:00.000Z");
    const future = new Date("2026-04-20T00:00:00.000Z");
    const createdArticleIds: string[] = [];
    const createdProjectIds: string[] = [];
    const createdFriendLinkIds: string[] = [];

    try {
      const publishedArticle = await prisma.article.create({
        data: {
          publishedAt: past,
          slug: `public-published-${suffix}`,
          status: ArticleStatus.Published,
          title: `Public Published ${suffix}`,
        },
      });
      const draftArticle = await prisma.article.create({
        data: {
          publishedAt: past,
          slug: `public-draft-${suffix}`,
          status: ArticleStatus.Draft,
          title: `Public Draft ${suffix}`,
        },
      });
      const archivedArticle = await prisma.article.create({
        data: {
          publishedAt: past,
          slug: `public-archived-${suffix}`,
          status: ArticleStatus.Archived,
          title: `Public Archived ${suffix}`,
        },
      });
      const futureArticle = await prisma.article.create({
        data: {
          publishedAt: future,
          slug: `public-future-${suffix}`,
          status: ArticleStatus.Published,
          title: `Public Future ${suffix}`,
        },
      });
      createdArticleIds.push(publishedArticle.id, draftArticle.id, archivedArticle.id, futureArticle.id);

      const publishedProject = await prisma.project.create({
        data: {
          category: ProjectCategory.Web,
          name: `Public Project ${suffix}`,
          publishedAt: past,
          slug: `public-project-${suffix}`,
          summary: "Published project.",
        },
      });
      const unpublishedProject = await prisma.project.create({
        data: {
          category: ProjectCategory.Web,
          name: `Unpublished Project ${suffix}`,
          slug: `unpublished-project-${suffix}`,
          summary: "Unpublished project.",
        },
      });
      createdProjectIds.push(publishedProject.id, unpublishedProject.id);

      const approvedFriendLink = await prisma.friendLink.create({
        data: {
          description: "Approved friend link.",
          siteName: `Approved ${suffix}`,
          siteUrl: `https://approved-${suffix}.example.com`,
          status: FriendLinkStatus.Approved,
        },
      });
      const pendingFriendLink = await prisma.friendLink.create({
        data: {
          description: "Pending friend link.",
          siteName: `Pending ${suffix}`,
          siteUrl: `https://pending-${suffix}.example.com`,
          status: FriendLinkStatus.Pending,
        },
      });
      createdFriendLinkIds.push(approvedFriendLink.id, pendingFriendLink.id);

      const [articles, projects, friendLinks] = await Promise.all([
        repository.findPublishedArticles({
          page: 1,
          pageSize: 10,
          now,
          skip: 0,
          take: 10,
        }),
        repository.findPublishedProjects({
          page: 1,
          pageSize: 10,
          now,
          skip: 0,
          take: 10,
        }),
        repository.findApprovedFriendLinks({
          page: 1,
          pageSize: 10,
          skip: 0,
          take: 10,
        }),
      ]);

      const articleSlugs = articles.map((article) => article.slug);
      const projectSlugs = projects.map((project) => project.slug);
      const friendLinkUrls = friendLinks.map((friendLink) => friendLink.siteUrl);

      expect(articleSlugs).toContain(publishedArticle.slug);
      expect(articleSlugs).not.toContain(draftArticle.slug);
      expect(articleSlugs).not.toContain(archivedArticle.slug);
      expect(articleSlugs).not.toContain(futureArticle.slug);
      expect(projectSlugs).toContain(publishedProject.slug);
      expect(projectSlugs).not.toContain(unpublishedProject.slug);
      expect(friendLinkUrls).toContain(approvedFriendLink.siteUrl);
      expect(friendLinkUrls).not.toContain(pendingFriendLink.siteUrl);
    } finally {
      await prisma.friendLink.deleteMany({
        where: {
          id: {
            in: createdFriendLinkIds,
          },
        },
      });
      await prisma.project.deleteMany({
        where: {
          id: {
            in: createdProjectIds,
          },
        },
      });
      await prisma.article.deleteMany({
        where: {
          id: {
            in: createdArticleIds,
          },
        },
      });
    }
  });
});
