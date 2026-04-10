import { z } from "zod";

const analyticsPeriodValues = [7, 30, 90] as const;

export const analyticsQuerySchema = z.object({
  period: z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") {
        return 30;
      }

      return value;
    },
    z.coerce
      .number({
        error: "Analytics period must be a number.",
      })
      .int("Analytics period must be an integer.")
      .refine((value): value is AnalyticsPeriod => analyticsPeriodValues.includes(value as AnalyticsPeriod), {
        message: "Analytics period must be one of 7, 30, or 90.",
      }),
  ),
});

export type AnalyticsPeriod = (typeof analyticsPeriodValues)[number];
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

export type AnalyticsMetricTone = "info" | "success" | "warning";

export type AnalyticsSummaryMetricDto = {
  deltaLabel: string;
  deltaPercent: number | null;
  formattedValue: string;
  key: "newVisitors" | "totalArticles" | "totalComments" | "totalSubscribers" | "totalViews";
  title: string;
  tone: AnalyticsMetricTone;
  value: number;
};

export type AnalyticsDailyMetricDto = {
  date: string;
  label: string;
  newVisitors: number;
  totalArticles: number;
  totalComments: number;
  totalSubscribers: number;
  totalViews: number;
};

export type AnalyticsPopularArticleDto = {
  comments: number;
  formattedViews: string;
  id: string;
  likes: number;
  slug: string;
  title: string;
  views: number;
};

export type AnalyticsDashboardDto = {
  dailyMetrics: AnalyticsDailyMetricDto[];
  period: AnalyticsPeriod;
  popularArticles: AnalyticsPopularArticleDto[];
  summary: AnalyticsSummaryMetricDto[];
};
