import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type DateRange = {
  endDate: Date;
  startDate: Date;
};

export type SiteMetricDailyRecord = {
  metricDate: Date;
  newVisitors: number;
  totalArticles: number;
  totalComments: number;
  totalSubscribers: number;
  totalViews: number;
};

export type PopularArticleRecord = {
  comments: number;
  id: string;
  likes: number;
  slug: string;
  title: string;
  views: number;
};

export type AnalyticsFallbackCounts = {
  articleCount: number;
  currentCommentCount: number;
  currentMetricViews: number;
  previousCommentCount: number;
  previousMetricViews: number;
  totalArticleViewCount: number;
};

export type AnalyticsRepository = {
  countFallbacks: (ranges: { current: DateRange; previous: DateRange }) => Promise<AnalyticsFallbackCounts>;
  findLatestSiteMetric: () => Promise<SiteMetricDailyRecord | null>;
  findPopularArticles: (range: DateRange, take: number) => Promise<PopularArticleRecord[]>;
  findSiteMetrics: (range: DateRange) => Promise<SiteMetricDailyRecord[]>;
};

const siteMetricDailySelect = {
  metricDate: true,
  newVisitors: true,
  totalArticles: true,
  totalComments: true,
  totalSubscribers: true,
  totalViews: true,
} satisfies Prisma.SiteMetricDailySelect;

const articleSelect = {
  commentCount: true,
  id: true,
  likeCount: true,
  slug: true,
  title: true,
  viewCount: true,
} satisfies Prisma.ArticleSelect;

export function createAnalyticsRepository(database: PrismaClient = prisma): AnalyticsRepository {
  return {
    async countFallbacks({ current, previous }) {
      const [
        articleCount,
        currentCommentCount,
        currentMetricViews,
        previousCommentCount,
        previousMetricViews,
        totalArticleViews,
      ] = await Promise.all([
        database.article.count(),
        database.comment.count({
          where: {
            createdAt: buildDateTimeWhere(current),
          },
        }),
        database.articleMetricDaily.aggregate({
          _sum: {
            views: true,
          },
          where: buildMetricDateWhere(current),
        }),
        database.comment.count({
          where: {
            createdAt: buildDateTimeWhere(previous),
          },
        }),
        database.articleMetricDaily.aggregate({
          _sum: {
            views: true,
          },
          where: buildMetricDateWhere(previous),
        }),
        database.article.aggregate({
          _sum: {
            viewCount: true,
          },
        }),
      ]);

      return {
        articleCount,
        currentCommentCount,
        currentMetricViews: currentMetricViews._sum.views ?? 0,
        previousCommentCount,
        previousMetricViews: previousMetricViews._sum.views ?? 0,
        totalArticleViewCount: totalArticleViews._sum.viewCount ?? 0,
      };
    },
    async findLatestSiteMetric() {
      return database.siteMetricDaily.findFirst({
        orderBy: {
          metricDate: "desc",
        },
        select: siteMetricDailySelect,
      });
    },
    async findPopularArticles(range, take) {
      const metricRows = await database.articleMetricDaily.groupBy({
        _sum: {
          comments: true,
          likes: true,
          views: true,
        },
        by: ["articleId"],
        orderBy: {
          _sum: {
            views: "desc",
          },
        },
        take,
        where: buildMetricDateWhere(range),
      });

      if (metricRows.length > 0) {
        const articleIds = metricRows.map((row) => row.articleId);
        const articles = await database.article.findMany({
          select: articleSelect,
          where: {
            id: {
              in: articleIds,
            },
          },
        });
        const articleById = new Map(articles.map((article) => [article.id, article]));

        return metricRows.flatMap((row) => {
          const article = articleById.get(row.articleId);

          if (!article) {
            return [];
          }

          return {
            comments: row._sum.comments ?? 0,
            id: article.id,
            likes: row._sum.likes ?? 0,
            slug: article.slug,
            title: article.title,
            views: row._sum.views ?? 0,
          };
        });
      }

      const articles = await database.article.findMany({
        orderBy: [
          {
            viewCount: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
        select: articleSelect,
        take,
      });

      return articles.map((article) => ({
        comments: article.commentCount,
        id: article.id,
        likes: article.likeCount,
        slug: article.slug,
        title: article.title,
        views: article.viewCount,
      }));
    },
    async findSiteMetrics(range) {
      return database.siteMetricDaily.findMany({
        orderBy: {
          metricDate: "asc",
        },
        select: siteMetricDailySelect,
        where: buildMetricDateWhere(range),
      });
    },
  };
}

function buildMetricDateWhere(range: DateRange) {
  return {
    metricDate: {
      gte: range.startDate,
      lte: range.endDate,
    },
  };
}

function buildDateTimeWhere(range: DateRange) {
  return {
    gte: range.startDate,
    lt: addDays(range.endDate, 1),
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}
