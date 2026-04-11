import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createDashboardHandler } from "@/lib/dashboard/dashboard-handler";
import { createDashboardRepository } from "@/lib/dashboard/dashboard-repository";
import { createDashboardService } from "@/lib/dashboard/dashboard-service";

const dashboardHandler = createDashboardHandler({
  requireSession: requireApiSession,
  service: createDashboardService(createDashboardRepository()),
});

export const GET = handleRoute(async (request: Request) => dashboardHandler.getDashboard(request));
