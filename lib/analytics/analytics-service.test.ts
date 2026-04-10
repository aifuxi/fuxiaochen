import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { AnalyticsRepository, SiteMetricDailyRecord } from "@/lib/analytics/analytics-repository";
import { createAnalyticsService } from "@/lib/analytics/analytics-service";

const currentMetric: SiteMetricDailyRecord = {
  metricDate: new Date(2026, 3, 11),
  newVisitors: 40,
  totalArticles: 12,
  totalComments: 8,
  totalSubscribers: 30,
  totalViews: 200,
};

const previousMetric: SiteMetricDailyRecord = {
  metricDate: new Date(2026, 3, 4),
  newVisitors: 20,
  totalArticles: 10,
  totalComments: 4,
  totalSubscribers: 25,
  totalViews: 100,
};

function createRepositoryStub(overrides: Partial<AnalyticsRepository> = {}): AnalyticsRepository {
  return {
    countFallbacks: async () => ({
      articleCount: 12,
      currentCommentCount: 8,
      currentMetricViews: 0,
      previousCommentCount: 4,
      previousMetricViews: 0,
      totalArticleViewCount: 500,
    }),
    findLatestSiteMetric: async () => currentMetric,
    findPopularArticles: async () => [
      {
        comments: 2,
        id: "article_1",
        likes: 3,
        slug: "analytics",
        title: "Analytics",
        views: 120,
      },
    ],
    findSiteMetrics: async ({ endDate }) => (endDate < new Date(2026, 3, 5) ? [previousMetric] : [currentMetric]),
    ...overrides,
  };
}

describe("analytics service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 11, 10));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("builds analytics dashboard from daily metrics", async () => {
    const service = createAnalyticsService(createRepositoryStub());

    const dashboard = await service.getDashboard({
      period: 7,
    });

    expect(dashboard.period).toBe(7);
    expect(dashboard.dailyMetrics).toHaveLength(7);
    expect(dashboard.dailyMetrics.at(-1)).toMatchObject({
      date: "2026-04-11",
      totalViews: 200,
    });
    expect(dashboard.summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deltaLabel: "+100%",
          key: "totalViews",
          value: 200,
        }),
        expect.objectContaining({
          deltaLabel: "+20%",
          key: "totalArticles",
          value: 12,
        }),
      ]),
    );
    expect(dashboard.popularArticles).toEqual([
      expect.objectContaining({
        formattedViews: "120",
        slug: "analytics",
      }),
    ]);
  });

  test("falls back to live content counts when site metrics are empty", async () => {
    const service = createAnalyticsService(
      createRepositoryStub({
        findLatestSiteMetric: async () => null,
        findSiteMetrics: async () => [],
      }),
    );

    const dashboard = await service.getDashboard({
      period: 30,
    });

    expect(dashboard.summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deltaLabel: "No baseline",
          key: "totalViews",
          value: 500,
        }),
        expect.objectContaining({
          deltaLabel: "No baseline",
          key: "totalArticles",
          value: 12,
        }),
        expect.objectContaining({
          deltaLabel: "+100%",
          key: "totalComments",
          value: 8,
        }),
      ]),
    );
  });
});
