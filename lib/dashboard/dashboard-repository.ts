import { ArticleStatus, CommentStatus } from "@/generated/prisma/enums";
import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type DateRange = {
  endDate: Date;
  startDate: Date;
};

export type DashboardCountsRecord = {
  averageReadTimeMinutes: number | null;
  currentAverageReadTimeMinutes: number | null;
  currentPendingComments: number;
  currentPublishedArticles: number;
  currentViews: number;
  pendingComments: number;
  previousAverageReadTimeMinutes: number | null;
  previousPendingComments: number;
  previousPublishedArticles: number;
  previousViews: number;
  publishedArticles: number;
  totalViews: number;
};

export type DashboardArticleRecord = {
  category: {
    name: string;
  } | null;
  id: string;
  status: ArticleStatus;
  title: string;
  updatedAt: Date;
};

export type DashboardActivityRecords = {
  articles: Array<{
    id: string;
    title: string;
    updatedAt: Date;
  }>;
  changelogReleases: Array<{
    createdAt: Date;
    id: string;
    title: string;
    version: string;
  }>;
  comments: Array<{
    article: {
      title: string;
    };
    authorName: string;
    createdAt: Date;
    id: string;
    status: CommentStatus;
  }>;
  users: Array<{
    createdAt: Date;
    id: string;
    name: string;
  }>;
};

export type DashboardRepository = {
  countDashboardMetrics: (ranges: { current: DateRange; previous: DateRange }) => Promise<DashboardCountsRecord>;
  findRecentActivities: (take: number) => Promise<DashboardActivityRecords>;
  findRecentArticles: (take: number) => Promise<DashboardArticleRecord[]>;
};

const dashboardArticleSelect = {
  category: {
    select: {
      name: true,
    },
  },
  id: true,
  status: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

export function createDashboardRepository(database: PrismaClient = prisma): DashboardRepository {
  return {
    async countDashboardMetrics({ current, previous }) {
      const [
        averageReadTime,
        currentAverageReadTime,
        currentPendingComments,
        currentPublishedArticles,
        currentViews,
        pendingComments,
        previousAverageReadTime,
        previousPendingComments,
        previousPublishedArticles,
        previousViews,
        publishedArticles,
        totalViews,
      ] = await Promise.all([
        database.article.aggregate({
          _avg: {
            readingTimeMinutes: true,
          },
          where: {
            status: ArticleStatus.Published,
          },
        }),
        database.article.aggregate({
          _avg: {
            readingTimeMinutes: true,
          },
          where: buildPublishedArticleRangeWhere(current),
        }),
        database.comment.count({
          where: {
            createdAt: buildDateTimeWhere(current),
            status: CommentStatus.Pending,
          },
        }),
        database.article.count({
          where: buildPublishedArticleRangeWhere(current),
        }),
        database.articleMetricDaily.aggregate({
          _sum: {
            views: true,
          },
          where: buildMetricDateWhere(current),
        }),
        database.comment.count({
          where: {
            status: CommentStatus.Pending,
          },
        }),
        database.article.aggregate({
          _avg: {
            readingTimeMinutes: true,
          },
          where: buildPublishedArticleRangeWhere(previous),
        }),
        database.comment.count({
          where: {
            createdAt: buildDateTimeWhere(previous),
            status: CommentStatus.Pending,
          },
        }),
        database.article.count({
          where: buildPublishedArticleRangeWhere(previous),
        }),
        database.articleMetricDaily.aggregate({
          _sum: {
            views: true,
          },
          where: buildMetricDateWhere(previous),
        }),
        database.article.count({
          where: {
            status: ArticleStatus.Published,
          },
        }),
        database.article.aggregate({
          _sum: {
            viewCount: true,
          },
        }),
      ]);

      return {
        averageReadTimeMinutes: averageReadTime._avg.readingTimeMinutes,
        currentAverageReadTimeMinutes: currentAverageReadTime._avg.readingTimeMinutes,
        currentPendingComments,
        currentPublishedArticles,
        currentViews: currentViews._sum.views ?? 0,
        pendingComments,
        previousAverageReadTimeMinutes: previousAverageReadTime._avg.readingTimeMinutes,
        previousPendingComments,
        previousPublishedArticles,
        previousViews: previousViews._sum.views ?? 0,
        publishedArticles,
        totalViews: totalViews._sum.viewCount ?? 0,
      };
    },
    async findRecentActivities(take) {
      const [articles, changelogReleases, comments, users] = await Promise.all([
        database.article.findMany({
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
          take,
        }),
        database.changelogRelease.findMany({
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
            id: true,
            title: true,
            version: true,
          },
          take,
        }),
        database.comment.findMany({
          orderBy: {
            createdAt: "desc",
          },
          select: {
            article: {
              select: {
                title: true,
              },
            },
            authorName: true,
            createdAt: true,
            id: true,
            status: true,
          },
          take,
        }),
        database.user.findMany({
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
            id: true,
            name: true,
          },
          take,
        }),
      ]);

      return {
        articles,
        changelogReleases,
        comments,
        users,
      };
    },
    async findRecentArticles(take) {
      return database.article.findMany({
        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: dashboardArticleSelect,
        take,
      });
    },
  };
}

function buildPublishedArticleRangeWhere(range: DateRange): Prisma.ArticleWhereInput {
  return {
    publishedAt: buildDateTimeWhere(range),
    status: ArticleStatus.Published,
  };
}

function buildMetricDateWhere(range: DateRange): Prisma.ArticleMetricDailyWhereInput {
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
