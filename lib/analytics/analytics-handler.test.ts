import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { handleRoute } from "@/lib/api/handle-route";
import { createAnalyticsHandler } from "@/lib/analytics/analytics-handler";
import type { AnalyticsService } from "@/lib/analytics/analytics-service";

const sampleDashboard = {
  dailyMetrics: [],
  period: 30 as const,
  popularArticles: [],
  summary: [],
};

function createServiceStub(overrides: Partial<AnalyticsService> = {}): AnalyticsService {
  return {
    getDashboard: async () => sampleDashboard,
    ...overrides,
  };
}

describe("analytics handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createAnalyticsHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.getDashboard(request));
    const response = await route(new Request("http://localhost/api/analytics"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns analytics dashboard for a valid period", async () => {
    let requestedPeriod = 30;
    const handler = createAnalyticsHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub({
        getDashboard: async ({ period }) => {
          requestedPeriod = period;

          return {
            ...sampleDashboard,
            period,
          };
        },
      }),
    });

    const route = handleRoute(async (request: Request) => handler.getDashboard(request));
    const response = await route(new Request("http://localhost/api/analytics?period=90"));

    expect(requestedPeriod).toBe(90);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        period: 90,
      },
      success: true,
    });
  });

  test("returns 400 when period is invalid", async () => {
    const handler = createAnalyticsHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.getDashboard(request));
    const response = await route(new Request("http://localhost/api/analytics?period=365"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.VALIDATION_ERROR,
      success: false,
    });
  });
});
