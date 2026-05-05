import { requireRequestSession } from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";

import { adminAnalyticsQuerySchema } from "./dto";
import { toAdminAnalytics } from "./mappers";
import {
  createAnalyticsService,
  type AnalyticsService,
  type AnalyticsServiceDeps,
} from "./service";

type AnalyticsHandlerDeps = {
  service?: AnalyticsService;
  serviceDeps?: AnalyticsServiceDeps;
};

export function createAdminAnalyticsHandlers({
  serviceDeps,
  service = createAnalyticsService(serviceDeps),
}: AnalyticsHandlerDeps = {}) {
  return {
    async handleGetAnalytics(request: Request) {
      return withApiTiming(request, "admin.analytics.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminAnalyticsQuerySchema.parse({
            range: url.searchParams.get("range") ?? undefined,
          });
        });
        const snapshot = await timing.time("service", () =>
          service.getSnapshot(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminAnalytics(snapshot)),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminAnalyticsHandlers();

export const handleAdminGetAnalytics = defaultAdminHandlers.handleGetAnalytics;
