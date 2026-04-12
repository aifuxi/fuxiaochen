import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ArticleStatus, FriendLinkStatus, ProjectCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type {
  CreateFriendLinkApplicationInput,
  PublicListArticlesQuery,
  PublicListChangelogQuery,
  PublicListFriendLinksQuery,
  PublicListProjectsQuery,
} from "@/lib/public/public-content-dto";
import type {
  toPublicArticleDto,
  toPublicArticleListItemDto,
  toPublicChangelogReleaseDto,
  toPublicFriendLinkDto,
  toPublicProjectDto,
  toPublicSiteDto,
} from "@/lib/public/public-content-dto";

type PublicArticleListRecord = Parameters<typeof toPublicArticleListItemDto>[0];
type PublicArticleDetailRecord = Parameters<typeof toPublicArticleDto>[0];
type PublicProjectRecord = Parameters<typeof toPublicProjectDto>[0];
type PublicFriendLinkRecord = Parameters<typeof toPublicFriendLinkDto>[0];
type PublicChangelogReleaseRecord = Parameters<typeof toPublicChangelogReleaseDto>[0];
type PublicSiteInput = Parameters<typeof toPublicSiteDto>[0];
type PublicSettingsRecord = PublicSiteInput["settings"];
type PublicArticleCategorySummaryRecord = PublicSiteInput["articleCategories"][number];

type FindPublishedArticlesOptions = PublicListArticlesQuery & {
  now: Date;
  skip: number;
  take: number;
};

type FindPublishedProjectsOptions = PublicListProjectsQuery & {
  now: Date;
  skip: number;
  take: number;
};

type FindApprovedFriendLinksOptions = PublicListFriendLinksQuery & {
  skip: number;
  take: number;
};

type FindChangelogReleasesOptions = PublicListChangelogQuery & {
  skip: number;
  take: number;
};

export type PublicContentRepository = {
  countApprovedFriendLinks: (filters: PublicListFriendLinksQuery) => Promise<number>;
  countChangelogReleases: (filters: PublicListChangelogQuery) => Promise<number>;
  countPublishedArticles: (filters: PublicListArticlesQuery, now: Date) => Promise<number>;
  countPublishedProjects: (filters: PublicListProjectsQuery, now: Date) => Promise<number>;
  createFriendLinkApplication: (input: CreateFriendLinkApplicationInput) => Promise<{ id: string; status: FriendLinkStatus }>;
  findApprovedFriendLinks: (options: FindApprovedFriendLinksOptions) => Promise<PublicFriendLinkRecord[]>;
  findArticleCategories: (now: Date) => Promise<PublicArticleCategorySummaryRecord[]>;
  findChangelogReleases: (options: FindChangelogReleasesOptions) => Promise<PublicChangelogReleaseRecord[]>;
  findLatestSubscriberCount: () => Promise<number>;
  findPublishedArticleBySlug: (slug: string, now: Date) => Promise<PublicArticleDetailRecord | null>;
  findPublishedArticleSlugs: (now: Date) => Promise<Array<{ slug: string }>>;
  findPublishedArticles: (options: FindPublishedArticlesOptions) => Promise<PublicArticleListRecord[]>;
  findPublishedProjects: (options: FindPublishedProjectsOptions) => Promise<PublicProjectRecord[]>;
  findRelatedPublishedArticles: (options: { articleId: string; categoryId: string | null; now: Date; take: number }) => Promise<PublicArticleListRecord[]>;
  findSettings: () => Promise<PublicSettingsRecord>;
  getPublicStats: (now: Date) => Promise<PublicSiteInput["stats"]>;
};

const publicAssetSelect = {
  altText: true,
  originalUrl: true,
} satisfies Prisma.MediaAssetSelect;

const publicArticleCategorySelect = {
  color: true,
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.CategorySelect;

const publicArticleTagSelect = {
  tag: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ArticleTagSelect;

const publicArticleListSelect = {
  articleTags: {
    orderBy: {
      tag: {
        sortOrder: "asc",
      },
    },
    select: publicArticleTagSelect,
  },
  category: {
    select: publicArticleCategorySelect,
  },
  commentCount: true,
  coverAsset: {
    select: publicAssetSelect,
  },
  excerpt: true,
  id: true,
  isFeatured: true,
  likeCount: true,
  publishedAt: true,
  readingTimeMinutes: true,
  slug: true,
  title: true,
  viewCount: true,
} satisfies Prisma.ArticleSelect;

const publicArticleDetailSelect = {
  ...publicArticleListSelect,
  categoryId: true,
  contentHtml: true,
  contentMarkdown: true,
  seoDescription: true,
  seoTitle: true,
} satisfies Prisma.ArticleSelect;

const publicProjectSelect = {
  badgeLabel: true,
  category: true,
  coverAsset: {
    select: publicAssetSelect,
  },
  detail: true,
  externalUrl: true,
  id: true,
  isFeatured: true,
  metricLabel: true,
  metricValue: true,
  name: true,
  publishedAt: true,
  slug: true,
  sourceUrl: true,
  summary: true,
  technologies: {
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      techName: true,
    },
  },
} satisfies Prisma.ProjectSelect;

const publicFriendLinkSelect = {
  avatarAsset: {
    select: publicAssetSelect,
  },
  description: true,
  domain: true,
  id: true,
  siteName: true,
  siteUrl: true,
  subtitle: true,
} satisfies Prisma.FriendLinkSelect;

const publicChangelogReleaseSelect = {
  id: true,
  isMajor: true,
  items: {
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      description: true,
      id: true,
      itemType: true,
      title: true,
    },
  },
  releasedOn: true,
  summary: true,
  title: true,
  version: true,
} satisfies Prisma.ChangelogReleaseSelect;

const publicSettingsSelect = {
  accentColor: true,
  blogDescription: true,
  blogName: true,
  blogUrl: true,
  contactEmail: true,
  defaultMetaDescription: true,
  defaultMetaTitle: true,
  languageCode: true,
  logoAsset: {
    select: publicAssetSelect,
  },
  theme: true,
  timezone: true,
} satisfies Prisma.SiteSettingSelect;

export function createPublicContentRepository(database: PrismaClient = prisma): PublicContentRepository {
  return {
    async countApprovedFriendLinks(filters) {
      return database.friendLink.count({
        where: buildFriendLinkWhere(filters),
      });
    },
    async countChangelogReleases(filters) {
      return database.changelogRelease.count({
        where: buildChangelogWhere(filters),
      });
    },
    async countPublishedArticles(filters, now) {
      return database.article.count({
        where: buildPublishedArticleWhere(filters, now),
      });
    },
    async countPublishedProjects(filters, now) {
      return database.project.count({
        where: buildPublishedProjectWhere(filters, now),
      });
    },
    async createFriendLinkApplication(input) {
      return database.friendLinkApplication.create({
        data: {
          avatarUrl: input.avatarUrl,
          siteDescription: input.siteDescription,
          siteName: input.siteName,
          siteUrl: input.siteUrl,
          status: FriendLinkStatus.Pending,
        },
        select: {
          id: true,
          status: true,
        },
      });
    },
    async findApprovedFriendLinks({ keyword, page: _page, pageSize: _pageSize, skip, take }) {
      return database.friendLink.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            updatedAt: "desc",
          },
        ],
        select: publicFriendLinkSelect,
        skip,
        take,
        where: buildFriendLinkWhere({ keyword }),
      });
    },
    async findArticleCategories(now) {
      const groupedCategories = await database.article.groupBy({
        _count: {
          _all: true,
        },
        by: ["categoryId"],
        where: {
          ...buildPublishedArticleWhere({}, now),
          categoryId: {
            not: null,
          },
        },
      });
      const countsByCategoryId = new Map(
        groupedCategories.flatMap((category) =>
          category.categoryId ? [[category.categoryId, category._count._all] as const] : [],
        ),
      );
      const categories = await database.category.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
        select: publicArticleCategorySelect,
        where: {
          id: {
            in: Array.from(countsByCategoryId.keys()),
          },
        },
      });

      return categories.map((category) => ({
        ...category,
        usageCount: countsByCategoryId.get(category.id) ?? 0,
      }));
    },
    async findChangelogReleases({ isMajor, page: _page, pageSize: _pageSize, skip, take }) {
      return database.changelogRelease.findMany({
        orderBy: [
          {
            releasedOn: "desc",
          },
          {
            sortOrder: "asc",
          },
        ],
        select: publicChangelogReleaseSelect,
        skip,
        take,
        where: buildChangelogWhere({ isMajor }),
      });
    },
    async findLatestSubscriberCount() {
      const latestMetric = await database.siteMetricDaily.findFirst({
        orderBy: {
          metricDate: "desc",
        },
        select: {
          totalSubscribers: true,
        },
      });

      return latestMetric?.totalSubscribers ?? 0;
    },
    async findPublishedArticleBySlug(slug, now) {
      return database.article.findFirst({
        select: publicArticleDetailSelect,
        where: buildPublishedArticleWhere({ slug }, now),
      });
    },
    async findPublishedArticleSlugs(now) {
      return database.article.findMany({
        orderBy: {
          publishedAt: "desc",
        },
        select: {
          slug: true,
        },
        where: buildPublishedArticleWhere({}, now),
      });
    },
    async findPublishedArticles({ categorySlug, featured, keyword, page: _page, pageSize: _pageSize, skip, take, now }) {
      return database.article.findMany({
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
        select: publicArticleListSelect,
        skip,
        take,
        where: buildPublishedArticleWhere({ categorySlug, featured, keyword }, now),
      });
    },
    async findPublishedProjects({ category, featured, keyword, page: _page, pageSize: _pageSize, skip, take, now }) {
      return database.project.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            publishedAt: "desc",
          },
        ],
        select: publicProjectSelect,
        skip,
        take,
        where: buildPublishedProjectWhere({ category, featured, keyword }, now),
      });
    },
    async findRelatedPublishedArticles({ articleId, categoryId, now, take }) {
      const relatedArticles = await database.article.findMany({
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
        select: publicArticleListSelect,
        take,
        where: {
          ...buildPublishedArticleWhere({}, now),
          id: {
            not: articleId,
          },
          ...(categoryId ? { categoryId } : {}),
        },
      });

      if (relatedArticles.length >= take || !categoryId) {
        return relatedArticles;
      }

      const fallbackArticles = await database.article.findMany({
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
        select: publicArticleListSelect,
        take: take - relatedArticles.length,
        where: {
          ...buildPublishedArticleWhere({}, now),
          id: {
            notIn: [articleId, ...relatedArticles.map((article) => article.id)],
          },
        },
      });

      return [...relatedArticles, ...fallbackArticles];
    },
    async findSettings() {
      return database.siteSetting.upsert({
        create: {
          blogDescription: "A calm editorial system for writing, publishing, and managing content.",
          blogName: "SuperBlog",
          blogUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          commentSettings: {
            create: {
              allowAnonymous: false,
              enabled: true,
              maxReplyDepth: 3,
              moderationRequired: true,
              nestedRepliesEnabled: true,
            },
          },
          id: 1,
          languageCode: "en",
          theme: "dark",
          timezone: "Asia/Shanghai",
        },
        select: publicSettingsSelect,
        update: {},
        where: {
          id: 1,
        },
      });
    },
    async getPublicStats(now) {
      const [articleCount, projectCount, featuredProjectCount, openSourceProjectCount, projectCategories, latestMetric] =
        await Promise.all([
          database.article.count({
            where: buildPublishedArticleWhere({}, now),
          }),
          database.project.count({
            where: buildPublishedProjectWhere({}, now),
          }),
          database.project.count({
            where: buildPublishedProjectWhere({ featured: true }, now),
          }),
          database.project.count({
            where: buildPublishedProjectWhere({ category: ProjectCategory.OpenSource }, now),
          }),
          database.project.groupBy({
            by: ["category"],
            where: buildPublishedProjectWhere({}, now),
          }),
          database.siteMetricDaily.findFirst({
            orderBy: {
              metricDate: "desc",
            },
            select: {
              totalSubscribers: true,
            },
          }),
        ]);

      return {
        articleCount,
        featuredProjectCount,
        openSourceProjectCount,
        projectCategoryCount: projectCategories.length,
        projectCount,
        subscriberCount: latestMetric?.totalSubscribers ?? 0,
      };
    },
  };
}

function buildPublishedArticleWhere(
  filters: Partial<Pick<PublicListArticlesQuery, "categorySlug" | "featured" | "keyword">> & { slug?: string },
  now: Date,
): Prisma.ArticleWhereInput {
  return {
    publishedAt: {
      lte: now,
    },
    status: ArticleStatus.Published,
    ...(filters.slug ? { slug: filters.slug } : {}),
    ...(filters.categorySlug
      ? {
          category: {
            slug: filters.categorySlug,
          },
        }
      : {}),
    ...(filters.featured !== undefined ? { isFeatured: filters.featured } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              title: {
                contains: filters.keyword,
              },
            },
            {
              slug: {
                contains: filters.keyword,
              },
            },
            {
              excerpt: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

function buildPublishedProjectWhere(
  filters: Partial<Pick<PublicListProjectsQuery, "category" | "featured" | "keyword">>,
  now: Date,
): Prisma.ProjectWhereInput {
  return {
    publishedAt: {
      lte: now,
    },
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.featured !== undefined ? { isFeatured: filters.featured } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              name: {
                contains: filters.keyword,
              },
            },
            {
              slug: {
                contains: filters.keyword,
              },
            },
            {
              summary: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

function buildFriendLinkWhere(filters: Partial<Pick<PublicListFriendLinksQuery, "keyword">>): Prisma.FriendLinkWhereInput {
  return {
    status: FriendLinkStatus.Approved,
    ...(filters.keyword
      ? {
          OR: [
            {
              siteName: {
                contains: filters.keyword,
              },
            },
            {
              siteUrl: {
                contains: filters.keyword,
              },
            },
            {
              subtitle: {
                contains: filters.keyword,
              },
            },
            {
              description: {
                contains: filters.keyword,
              },
            },
            {
              domain: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

function buildChangelogWhere(filters: Partial<Pick<PublicListChangelogQuery, "isMajor">>): Prisma.ChangelogReleaseWhereInput {
  return {
    ...(filters.isMajor !== undefined ? { isMajor: filters.isMajor } : {}),
  };
}
