import { requireAdminRequestSession } from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";

import { adminApiTimingLogListQuerySchema } from "./dto";
import { toAdminApiTimingLogListItem } from "./mappers";
import {
  apiTimingLogService,
  createApiTimingLogService,
  type ApiTimingLogService,
  type ApiTimingLogServiceDeps,
} from "./service";

type ApiTimingLogHandlerDeps = {
  service?: ApiTimingLogService;
  serviceDeps?: ApiTimingLogServiceDeps;
};

export function createAdminApiTimingLogHandlers({
  serviceDeps,
  service = serviceDeps
    ? createApiTimingLogService(serviceDeps)
    : apiTimingLogService,
}: ApiTimingLogHandlerDeps = {}) {
  return {
    async handleListLogs(request: Request) {
      return withApiTiming(request, "admin.logs.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);

          return adminApiTimingLogListQuerySchema.parse({
            errorCode: url.searchParams.get("errorCode") ?? undefined,
            event: url.searchParams.get("event") ?? undefined,
            from: url.searchParams.get("from") ?? undefined,
            method: url.searchParams.get("method") ?? undefined,
            minTotalMs: url.searchParams.get("minTotalMs") ?? undefined,
            operation: url.searchParams.get("operation") ?? undefined,
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            path: url.searchParams.get("path") ?? undefined,
            requestId: url.searchParams.get("requestId") ?? undefined,
            scope: url.searchParams.get("scope") ?? undefined,
            status: url.searchParams.get("status") ?? undefined,
            statusClass: url.searchParams.get("statusClass") ?? undefined,
            to: url.searchParams.get("to") ?? undefined,
            userId: url.searchParams.get("userId") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listLogs(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminApiTimingLogListItem),
            },
            {
              page: query.page,
              pageSize: query.pageSize,
              total: result.total,
            },
          ),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminApiTimingLogHandlers();

export const handleAdminListApiTimingLogs = defaultAdminHandlers.handleListLogs;
