import {
  getSessionUserId,
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
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
      return withApiTiming(request, "admin.users.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminUserListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            role: url.searchParams.get("role") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listAdminUsers(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminUserListItem),
              stats: result.stats,
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
    async handleGetUser(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.users.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminUserIdParamsSchema.parse(await params),
        );
        const user = await timing.time("service", () =>
          service.getAdminUser(id),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminUserDetail(user)),
        );
      });
    },
    async handleUpdateUserRole(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.users.update-role",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);
          const actorUserId = getSessionUserId(session);
          const { id, body } = await timing.time("parse", async () => ({
            ...adminUserIdParamsSchema.parse(await params),
            body: adminUserRoleUpdateSchema.parse(await toJsonBody(request)),
          }));
          const user = await timing.time("service", () =>
            service.updateUserRole(id, body, actorUserId),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminUserDetail(user)),
          );
        },
      );
    },
    async handleRevokeUserSessions(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.users.revoke-sessions",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);
          const actorUserId = getSessionUserId(session);
          const { id } = await timing.time("parse", async () =>
            adminUserIdParamsSchema.parse(await params),
          );

          await timing.time("service", () =>
            service.revokeUserSessions(id, actorUserId),
          );

          return timing.timeSync("response", () => createSuccessResponse(null));
        },
      );
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
