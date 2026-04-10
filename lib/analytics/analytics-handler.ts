import { successResponse } from "@/lib/api/response";
import { analyticsQuerySchema } from "@/lib/analytics/analytics-dto";
import type { AnalyticsService } from "@/lib/analytics/analytics-service";

type AnalyticsHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: AnalyticsService;
};

export type AnalyticsHandler = {
  getDashboard: (request: Request) => Promise<Response>;
};

export function createAnalyticsHandler(dependencies: AnalyticsHandlerDependencies): AnalyticsHandler {
  return {
    async getDashboard(request) {
      await dependencies.requireSession(request);

      const query = parseAnalyticsQuery(request);
      const dashboard = await dependencies.service.getDashboard(query);

      return successResponse(dashboard, {
        message: "Analytics fetched successfully.",
      });
    },
  };
}

function parseAnalyticsQuery(request: Request) {
  const { searchParams } = new URL(request.url);

  return analyticsQuerySchema.parse({
    period: searchParams.get("period") ?? undefined,
  });
}
