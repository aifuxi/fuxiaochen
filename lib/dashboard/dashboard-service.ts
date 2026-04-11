import type { DashboardDto, DashboardMetricDto } from "@/lib/dashboard/dashboard-dto";
import { getCommentStatusLabel, toActivityDto, toDashboardArticleDto } from "@/lib/dashboard/dashboard-dto";
import type { DashboardActivityRecords, DashboardCountsRecord, DashboardRepository } from "@/lib/dashboard/dashboard-repository";

export type DashboardService = {
  getDashboard: () => Promise<DashboardDto>;
};

export function createDashboardService(repository: DashboardRepository): DashboardService {
  return {
    async getDashboard() {
      const ranges = getDashboardRanges();
      const [counts, recentArticles, recentActivities] = await Promise.all([
        repository.countDashboardMetrics(ranges),
        repository.findRecentArticles(5),
        repository.findRecentActivities(5),
      ]);

      return {
        activityFeed: buildActivityFeed(recentActivities, 6),
        recentArticles: recentArticles.map(toDashboardArticleDto),
        stats: buildStats(counts),
      };
    },
  };
}

function buildStats(counts: DashboardCountsRecord): DashboardMetricDto[] {
  return [
    {
      deltaLabel: formatDeltaLabel(calculateDeltaPercent(counts.currentPublishedArticles, counts.previousPublishedArticles)),
      key: "publishedArticles",
      title: "Published articles",
      tone: getMetricTone(calculateDeltaPercent(counts.currentPublishedArticles, counts.previousPublishedArticles)),
      value: formatCompactNumber(counts.publishedArticles),
    },
    {
      deltaLabel: formatDeltaLabel(calculateDeltaPercent(counts.currentPendingComments, counts.previousPendingComments)),
      key: "pendingComments",
      title: "Pending comments",
      tone: getMetricTone(calculateDeltaPercent(counts.currentPendingComments, counts.previousPendingComments), {
        lowerIsBetter: true,
      }),
      value: formatCompactNumber(counts.pendingComments),
    },
    {
      deltaLabel: formatDeltaLabel(calculateDeltaPercent(counts.currentViews, counts.previousViews)),
      key: "totalViews",
      title: "Total views",
      tone: getMetricTone(calculateDeltaPercent(counts.currentViews, counts.previousViews)),
      value: formatCompactNumber(counts.totalViews),
    },
    {
      deltaLabel: formatDeltaLabel(
        calculateNullableDeltaPercent(counts.currentAverageReadTimeMinutes, counts.previousAverageReadTimeMinutes),
      ),
      key: "avgReadTime",
      title: "Avg. read time",
      tone: getMetricTone(
        calculateNullableDeltaPercent(counts.currentAverageReadTimeMinutes, counts.previousAverageReadTimeMinutes),
      ),
      value: formatReadTime(counts.averageReadTimeMinutes),
    },
  ];
}

function buildActivityFeed(records: DashboardActivityRecords, take: number) {
  return [
    ...records.articles.map((article) => ({
      id: `article:${article.id}`,
      message: `Article "${article.title}" was updated.`,
      occurredAt: article.updatedAt,
      type: "article" as const,
    })),
    ...records.comments.map((comment) => ({
      id: `comment:${comment.id}`,
      message: `${comment.authorName} left a ${getCommentStatusLabel(comment.status)} comment on "${comment.article.title}".`,
      occurredAt: comment.createdAt,
      type: "comment" as const,
    })),
    ...records.changelogReleases.map((release) => ({
      id: `changelog:${release.id}`,
      message: `Release ${release.version} "${release.title}" was added.`,
      occurredAt: release.createdAt,
      type: "changelog" as const,
    })),
    ...records.users.map((user) => ({
      id: `user:${user.id}`,
      message: `${user.name} joined the CMS.`,
      occurredAt: user.createdAt,
      type: "user" as const,
    })),
  ]
    .sort((first, second) => second.occurredAt.getTime() - first.occurredAt.getTime())
    .slice(0, take)
    .map(toActivityDto);
}

function calculateDeltaPercent(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10;
}

function calculateNullableDeltaPercent(currentValue: number | null, previousValue: number | null) {
  if (currentValue === null || previousValue === null) {
    return null;
  }

  return calculateDeltaPercent(currentValue, previousValue);
}

function formatDeltaLabel(deltaPercent: number | null) {
  if (deltaPercent === null) {
    return "No baseline";
  }

  if (deltaPercent > 0) {
    return `+${deltaPercent}%`;
  }

  return `${deltaPercent}%`;
}

function getMetricTone(deltaPercent: number | null, options: { lowerIsBetter?: boolean } = {}): DashboardMetricDto["tone"] {
  if (deltaPercent === null || deltaPercent === 0) {
    return "info";
  }

  const isPositiveChange = options.lowerIsBetter ? deltaPercent < 0 : deltaPercent > 0;

  return isPositiveChange ? "success" : "warning";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(value);
}

function formatReadTime(value: number | null) {
  if (value === null || value <= 0) {
    return "0m";
  }

  const roundedMinutes = Math.max(Math.round(value), 1);

  return `${roundedMinutes}m`;
}

function getDashboardRanges() {
  const endDate = startOfDay(new Date());
  const startDate = addDays(endDate, -29);
  const previousEndDate = addDays(startDate, -1);
  const previousStartDate = addDays(previousEndDate, -29);

  return {
    current: {
      endDate,
      startDate,
    },
    previous: {
      endDate: previousEndDate,
      startDate: previousStartDate,
    },
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
