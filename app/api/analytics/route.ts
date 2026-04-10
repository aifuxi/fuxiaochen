import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createAnalyticsHandler } from "@/lib/analytics/analytics-handler";
import { createAnalyticsRepository } from "@/lib/analytics/analytics-repository";
import { createAnalyticsService } from "@/lib/analytics/analytics-service";

const analyticsHandler = createAnalyticsHandler({
  requireSession: requireApiSession,
  service: createAnalyticsService(createAnalyticsRepository()),
});

export const GET = handleRoute(async (request: Request) => analyticsHandler.getDashboard(request));
