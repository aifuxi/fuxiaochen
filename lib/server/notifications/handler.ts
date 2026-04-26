import { requireRequestSession } from "@/lib/auth-session";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { toErrorResponse } from "@/lib/server/http/error-handler";
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
      try {
        await requireRequestSession(request);

        const url = new URL(request.url);
        const query = adminNotificationListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          status: url.searchParams.get("status") ?? undefined,
        });
        const result = await service.listNotifications(query);

        return createSuccessResponse(toAdminNotificationListPayload(result), {
          page: query.page,
          pageSize: query.pageSize,
          total: result.total,
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateNotification(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireRequestSession(request);

        const { id } = adminNotificationIdParamsSchema.parse(await params);
        const body = adminNotificationReadSchema.parse(
          await toJsonBody(request),
        );
        const notification = await service.updateReadState(id, body);

        return createSuccessResponse(toAdminNotification(notification));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleMarkAllRead(request: Request) {
      try {
        await requireRequestSession(request);

        const updatedCount = await service.markAllRead();

        return createSuccessResponse({ updatedCount });
      } catch (error) {
        return toErrorResponse(error);
      }
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
