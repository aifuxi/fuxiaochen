import { ArticleStatus, CommentStatus } from "@/generated/prisma/enums";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { DashboardRepository } from "@/lib/dashboard/dashboard-repository";
import { createDashboardService } from "@/lib/dashboard/dashboard-service";

function createRepositoryStub(overrides: Partial<DashboardRepository> = {}): DashboardRepository {
  return {
    countDashboardMetrics: async () => ({
      averageReadTimeMinutes: 5.6,
      currentAverageReadTimeMinutes: 6,
      currentPendingComments: 1,
      currentPublishedArticles: 4,
      currentViews: 100,
      pendingComments: 3,
      previousAverageReadTimeMinutes: 3,
      previousPendingComments: 2,
      previousPublishedArticles: 2,
      previousViews: 50,
      publishedArticles: 12,
      totalViews: 500,
    }),
    findRecentActivities: async () => ({
      articles: [
        {
          id: "article_1",
          title: "Updated Article",
          updatedAt: new Date("2026-04-11T06:00:00.000Z"),
        },
      ],
      changelogReleases: [
        {
          createdAt: new Date("2026-04-08T06:00:00.000Z"),
          id: "release_1",
          title: "Dashboard",
          version: "1.0.0",
        },
      ],
      comments: [
        {
          article: {
            title: "Commented Article",
          },
          authorName: "Lin",
          createdAt: new Date("2026-04-10T06:00:00.000Z"),
          id: "comment_1",
          status: CommentStatus.Pending,
        },
      ],
      users: [
        {
          createdAt: new Date("2026-04-09T06:00:00.000Z"),
          id: "user_1",
          name: "Qin",
        },
      ],
    }),
    findRecentArticles: async () => [
      {
        category: {
          name: "Design",
        },
        id: "article_1",
        status: ArticleStatus.Published,
        title: "Updated Article",
        updatedAt: new Date("2026-04-11T06:00:00.000Z"),
      },
    ],
    ...overrides,
  };
}

describe("dashboard service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("builds dashboard overview from repository data", async () => {
    const service = createDashboardService(createRepositoryStub());

    const dashboard = await service.getDashboard();

    expect(dashboard.stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deltaLabel: "+100%",
          key: "publishedArticles",
          tone: "success",
          value: "12",
        }),
        expect.objectContaining({
          deltaLabel: "-50%",
          key: "pendingComments",
          tone: "success",
          value: "3",
        }),
        expect.objectContaining({
          key: "avgReadTime",
          value: "6m",
        }),
      ]),
    );
    expect(dashboard.recentArticles).toEqual([
      expect.objectContaining({
        category: "Design",
        status: ArticleStatus.Published,
        updatedAt: "2026-04-11T06:00:00.000Z",
      }),
    ]);
    expect(dashboard.activityFeed[0]).toMatchObject({
      id: "article:article_1",
      type: "article",
    });
  });

  test("handles missing baselines", async () => {
    const service = createDashboardService(
      createRepositoryStub({
        countDashboardMetrics: async () => ({
          averageReadTimeMinutes: null,
          currentAverageReadTimeMinutes: null,
          currentPendingComments: 0,
          currentPublishedArticles: 0,
          currentViews: 0,
          pendingComments: 0,
          previousAverageReadTimeMinutes: null,
          previousPendingComments: 0,
          previousPublishedArticles: 0,
          previousViews: 0,
          publishedArticles: 0,
          totalViews: 0,
        }),
      }),
    );

    const dashboard = await service.getDashboard();

    expect(dashboard.stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deltaLabel: "0%",
          key: "publishedArticles",
          value: "0",
        }),
        expect.objectContaining({
          deltaLabel: "No baseline",
          key: "avgReadTime",
          value: "0m",
        }),
      ]),
    );
  });
});
