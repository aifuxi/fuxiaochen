import { requireRequestSession } from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
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
      try {
        await requireRequestSession(request);

        const url = new URL(request.url);
        const query = adminAnalyticsQuerySchema.parse({
          range: url.searchParams.get("range") ?? undefined,
        });
        const snapshot = await service.getSnapshot(query);

        return createSuccessResponse(toAdminAnalytics(snapshot));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminAnalyticsHandlers();

export const handleAdminGetAnalytics = defaultAdminHandlers.handleGetAnalytics;
