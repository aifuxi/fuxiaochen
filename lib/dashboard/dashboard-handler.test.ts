import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { handleRoute } from "@/lib/api/handle-route";
import { createDashboardHandler } from "@/lib/dashboard/dashboard-handler";
import type { DashboardService } from "@/lib/dashboard/dashboard-service";

const sampleDashboard = {
  activityFeed: [],
  recentArticles: [],
  stats: [
    {
      deltaLabel: "+100%",
      key: "publishedArticles" as const,
      title: "Published articles",
      tone: "success" as const,
      value: "12",
    },
  ],
};

function createServiceStub(overrides: Partial<DashboardService> = {}): DashboardService {
  return {
    getDashboard: async () => sampleDashboard,
    ...overrides,
  };
}

describe("dashboard handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createDashboardHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.getDashboard(request));
    const response = await route(new Request("http://localhost/api/dashboard"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns dashboard payload", async () => {
    const handler = createDashboardHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.getDashboard(request));
    const response = await route(new Request("http://localhost/api/dashboard"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleDashboard,
      success: true,
    });
  });
});
