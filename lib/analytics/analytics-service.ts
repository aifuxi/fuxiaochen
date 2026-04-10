import type {
  AnalyticsDailyMetricDto,
  AnalyticsDashboardDto,
  AnalyticsPeriod,
  AnalyticsPopularArticleDto,
  AnalyticsSummaryMetricDto,
} from "@/lib/analytics/analytics-dto";
import type {
  AnalyticsFallbackCounts,
  AnalyticsRepository,
  SiteMetricDailyRecord,
} from "@/lib/analytics/analytics-repository";

type DateRange = {
  endDate: Date;
  startDate: Date;
};

type MetricTotals = {
  newVisitors: number;
  totalArticles: number;
  totalComments: number;
  totalSubscribers: number;
  totalViews: number;
};

export type AnalyticsService = {
  getDashboard: (query: { period: AnalyticsPeriod }) => Promise<AnalyticsDashboardDto>;
};

export function createAnalyticsService(repository: AnalyticsRepository): AnalyticsService {
  return {
    async getDashboard({ period }) {
      const ranges = getAnalyticsRanges(period);
      const [currentMetrics, previousMetrics, latestMetric, popularArticles, fallbackCounts] = await Promise.all([
        repository.findSiteMetrics(ranges.current),
        repository.findSiteMetrics(ranges.previous),
        repository.findLatestSiteMetric(),
        repository.findPopularArticles(ranges.current, 5),
        repository.countFallbacks(ranges),
      ]);

      const currentTotals = getCurrentTotals(currentMetrics, latestMetric, fallbackCounts);
      const previousTotals = getPreviousTotals(previousMetrics, fallbackCounts);

      return {
        dailyMetrics: currentMetrics.length > 0 ? buildDailyMetrics(ranges.current, currentMetrics) : [],
        period,
        popularArticles: popularArticles.map(toPopularArticleDto),
        summary: buildSummary(currentTotals, previousTotals, {
          hasCurrentSiteMetrics: currentMetrics.length > 0,
          hasPreviousSiteMetrics: previousMetrics.length > 0,
        }),
      };
    },
  };
}

function getCurrentTotals(
  currentMetrics: SiteMetricDailyRecord[],
  latestMetric: SiteMetricDailyRecord | null,
  fallbackCounts: AnalyticsFallbackCounts,
): MetricTotals {
  if (currentMetrics.length > 0) {
    const latestCurrentMetric = currentMetrics.at(-1) ?? latestMetric;

    return {
      ...sumDailyMetricTotals(currentMetrics),
      totalArticles: latestCurrentMetric?.totalArticles ?? fallbackCounts.articleCount,
      totalSubscribers: latestCurrentMetric?.totalSubscribers ?? latestMetric?.totalSubscribers ?? 0,
    };
  }

  return {
    newVisitors: 0,
    totalArticles: fallbackCounts.articleCount,
    totalComments: fallbackCounts.currentCommentCount,
    totalSubscribers: latestMetric?.totalSubscribers ?? 0,
    totalViews: fallbackCounts.currentMetricViews || fallbackCounts.totalArticleViewCount,
  };
}

function getPreviousTotals(
  previousMetrics: SiteMetricDailyRecord[],
  fallbackCounts: AnalyticsFallbackCounts,
): MetricTotals {
  if (previousMetrics.length > 0) {
    const latestPreviousMetric = previousMetrics.at(-1);

    return {
      ...sumDailyMetricTotals(previousMetrics),
      totalArticles: latestPreviousMetric?.totalArticles ?? 0,
      totalSubscribers: latestPreviousMetric?.totalSubscribers ?? 0,
    };
  }

  return {
    newVisitors: 0,
    totalArticles: 0,
    totalComments: fallbackCounts.previousCommentCount,
    totalSubscribers: 0,
    totalViews: fallbackCounts.previousMetricViews,
  };
}

function buildDailyMetrics(range: DateRange, metrics: SiteMetricDailyRecord[]): AnalyticsDailyMetricDto[] {
  const metricsByDate = new Map(metrics.map((metric) => [formatDateKey(metric.metricDate), metric]));
  const days = getDaysBetween(range.startDate, range.endDate);

  return days.map((date) => {
    const metric = metricsByDate.get(formatDateKey(date));

    return {
      date: formatDateKey(date),
      label: formatShortDateLabel(date),
      newVisitors: metric?.newVisitors ?? 0,
      totalArticles: metric?.totalArticles ?? 0,
      totalComments: metric?.totalComments ?? 0,
      totalSubscribers: metric?.totalSubscribers ?? 0,
      totalViews: metric?.totalViews ?? 0,
    };
  });
}

function buildSummary(
  currentTotals: MetricTotals,
  previousTotals: MetricTotals,
  options: {
    hasCurrentSiteMetrics: boolean;
    hasPreviousSiteMetrics: boolean;
  },
): AnalyticsSummaryMetricDto[] {
  return [
    toSummaryMetric({
      currentValue: currentTotals.totalViews,
      key: "totalViews",
      previousValue: previousTotals.totalViews,
      title: "Total views",
    }),
    toSummaryMetric({
      currentValue: currentTotals.newVisitors,
      key: "newVisitors",
      previousValue: previousTotals.newVisitors,
      title: "New visitors",
    }),
    toSummaryMetric({
      currentValue: currentTotals.totalComments,
      key: "totalComments",
      previousValue: previousTotals.totalComments,
      title: "Comments",
    }),
    toSummaryMetric({
      currentValue: currentTotals.totalSubscribers,
      key: "totalSubscribers",
      previousValue: previousTotals.totalSubscribers,
      title: "Subscribers",
      useBaseline: options.hasCurrentSiteMetrics && options.hasPreviousSiteMetrics,
    }),
    toSummaryMetric({
      currentValue: currentTotals.totalArticles,
      key: "totalArticles",
      previousValue: previousTotals.totalArticles,
      title: "Articles",
      useBaseline: options.hasCurrentSiteMetrics && options.hasPreviousSiteMetrics,
    }),
  ];
}

function toSummaryMetric({
  currentValue,
  key,
  previousValue,
  title,
  useBaseline = true,
}: {
  currentValue: number;
  key: AnalyticsSummaryMetricDto["key"];
  previousValue: number;
  title: string;
  useBaseline?: boolean;
}): AnalyticsSummaryMetricDto {
  const deltaPercent = useBaseline ? calculateDeltaPercent(currentValue, previousValue) : null;

  return {
    deltaLabel: formatDeltaLabel(deltaPercent),
    deltaPercent,
    formattedValue: formatCompactNumber(currentValue),
    key,
    title,
    tone: getMetricTone(deltaPercent),
    value: currentValue,
  };
}

function toPopularArticleDto(article: {
  comments: number;
  id: string;
  likes: number;
  slug: string;
  title: string;
  views: number;
}): AnalyticsPopularArticleDto {
  return {
    comments: article.comments,
    formattedViews: formatCompactNumber(article.views),
    id: article.id,
    likes: article.likes,
    slug: article.slug,
    title: article.title,
    views: article.views,
  };
}

function sumDailyMetricTotals(metrics: SiteMetricDailyRecord[]): MetricTotals {
  return metrics.reduce<MetricTotals>(
    (totals, metric) => ({
      newVisitors: totals.newVisitors + metric.newVisitors,
      totalArticles: totals.totalArticles + metric.totalArticles,
      totalComments: totals.totalComments + metric.totalComments,
      totalSubscribers: totals.totalSubscribers + metric.totalSubscribers,
      totalViews: totals.totalViews + metric.totalViews,
    }),
    {
      newVisitors: 0,
      totalArticles: 0,
      totalComments: 0,
      totalSubscribers: 0,
      totalViews: 0,
    },
  );
}

function calculateDeltaPercent(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10;
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

function getMetricTone(deltaPercent: number | null): AnalyticsSummaryMetricDto["tone"] {
  if (deltaPercent === null || deltaPercent === 0) {
    return "info";
  }

  return deltaPercent > 0 ? "success" : "warning";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(value);
}

function getAnalyticsRanges(period: AnalyticsPeriod) {
  const endDate = startOfDay(new Date());
  const startDate = addDays(endDate, -(period - 1));
  const previousEndDate = addDays(startDate, -1);
  const previousStartDate = addDays(previousEndDate, -(period - 1));

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

function getDaysBetween(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  let cursor = startOfDay(startDate);

  while (cursor <= endDate) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDateLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
