import { successResponse } from "@/lib/api/response";
import type { DashboardService } from "@/lib/dashboard/dashboard-service";

type DashboardHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: DashboardService;
};

export type DashboardHandler = {
  getDashboard: (request: Request) => Promise<Response>;
};

export function createDashboardHandler(dependencies: DashboardHandlerDependencies): DashboardHandler {
  return {
    async getDashboard(request) {
      await dependencies.requireSession(request);

      const dashboard = await dependencies.service.getDashboard();

      return successResponse(dashboard, {
        message: "Dashboard fetched successfully.",
      });
    },
  };
}
