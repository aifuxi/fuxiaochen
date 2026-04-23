import {
  getSessionUserId,
  requireAdminRequestSession,
} from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  adminUserIdParamsSchema,
  adminUserListQuerySchema,
  adminUserRoleUpdateSchema,
} from "./dto";
import { toAdminUserDetail, toAdminUserListItem } from "./mappers";
import {
  createUserService,
  type UserService,
  type UserServiceDeps,
} from "./service";

import { ERROR_CODES } from "../http/error-codes";
import { AppError } from "../http/errors";

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

type UserHandlerDeps = {
  service?: UserService;
  serviceDeps?: UserServiceDeps;
};

export function createAdminUserHandlers({
  serviceDeps,
  service = createUserService(serviceDeps),
}: UserHandlerDeps = {}) {
  return {
    async handleListUsers(request: Request) {
      try {
        await requireAdminRequestSession(request);

        const url = new URL(request.url);
        const query = adminUserListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          role: url.searchParams.get("role") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminUsers(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminUserListItem),
            stats: result.stats,
          },
          {
            page: query.page,
            pageSize: query.pageSize,
            total: result.total,
          },
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetUser(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminUserIdParamsSchema.parse(await params);
        const user = await service.getAdminUser(id);

        return createSuccessResponse(toAdminUserDetail(user));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateUserRole(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const session = await requireAdminRequestSession(request);
        const actorUserId = getSessionUserId(session);
        const { id } = adminUserIdParamsSchema.parse(await params);
        const body = adminUserRoleUpdateSchema.parse(await toJsonBody(request));
        const user = await service.updateUserRole(id, body, actorUserId);

        return createSuccessResponse(toAdminUserDetail(user));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleRevokeUserSessions(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const session = await requireAdminRequestSession(request);
        const actorUserId = getSessionUserId(session);
        const { id } = adminUserIdParamsSchema.parse(await params);

        await service.revokeUserSessions(id, actorUserId);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminUserHandlers();

export const handleAdminListUsers = defaultAdminHandlers.handleListUsers;
export const handleAdminGetUser = defaultAdminHandlers.handleGetUser;
export const handleAdminUpdateUserRole =
  defaultAdminHandlers.handleUpdateUserRole;
export const handleAdminRevokeUserSessions =
  defaultAdminHandlers.handleRevokeUserSessions;
