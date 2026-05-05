import { requireRequestSession } from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import { createSuccessResponse } from "@/lib/server/http/response";
import {
  adminNotificationIdParamsSchema,
  adminNotificationListQuerySchema,
  adminNotificationReadSchema,
} from "@/lib/server/notifications/dto";
import {
  toAdminNotification,
  toAdminNotificationListPayload,
} from "@/lib/server/notifications/mappers";

import {
  createNotificationService,
  type NotificationService,
  type NotificationServiceDeps,
} from "./service";

const toJsonBody = async (request: Request) => {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new AppError(
      ERROR_CODES.COMMON_INVALID_REQUEST,
      "Invalid JSON body",
      400,
    );
  }
};

type NotificationHandlerDeps = {
  service?: NotificationService;
  serviceDeps?: NotificationServiceDeps;
};

export function createAdminNotificationHandlers({
  serviceDeps,
  service = createNotificationService(serviceDeps),
}: NotificationHandlerDeps = {}) {
  return {
    async handleListNotifications(request: Request) {
      return withApiTiming(
        request,
        "admin.notifications.list",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireRequestSession(request),
          );
          timing.setSession(session);

          const query = timing.timeSync("parse", () => {
            const url = new URL(request.url);
            return adminNotificationListQuerySchema.parse({
              page: url.searchParams.get("page") ?? undefined,
              pageSize: url.searchParams.get("pageSize") ?? undefined,
              status: url.searchParams.get("status") ?? undefined,
            });
          });
          const result = await timing.time("service", () =>
            service.listNotifications(query),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminNotificationListPayload(result), {
              page: query.page,
              pageSize: query.pageSize,
              total: result.total,
            }),
          );
        },
      );
    },
    async handleUpdateNotification(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.notifications.update",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireRequestSession(request),
          );
          timing.setSession(session);

          const { id, body } = await timing.time("parse", async () => ({
            ...adminNotificationIdParamsSchema.parse(await params),
            body: adminNotificationReadSchema.parse(await toJsonBody(request)),
          }));
          const notification = await timing.time("service", () =>
            service.updateReadState(id, body),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminNotification(notification)),
          );
        },
      );
    },
    async handleMarkAllRead(request: Request) {
      return withApiTiming(
        request,
        "admin.notifications.mark-all-read",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireRequestSession(request),
          );
          timing.setSession(session);

          const updatedCount = await timing.time("service", () =>
            service.markAllRead(),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse({ updatedCount }),
          );
        },
      );
    },
  };
}

const defaultAdminHandlers = createAdminNotificationHandlers();

export const handleAdminListNotifications =
  defaultAdminHandlers.handleListNotifications;
export const handleAdminUpdateNotification =
  defaultAdminHandlers.handleUpdateNotification;
export const handleAdminMarkAllNotificationsRead =
  defaultAdminHandlers.handleMarkAllRead;
