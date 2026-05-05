import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicFriendContent } from "@/lib/server/public-content-cache";

import {
  adminFriendCreateSchema,
  adminFriendIdParamsSchema,
  adminFriendListQuerySchema,
  adminFriendUpdateSchema,
} from "./dto";
import { toAdminFriend, toPublicFriend } from "./mappers";
import {
  createFriendService,
  type FriendService,
  type FriendServiceDeps,
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

type FriendHandlerDeps = {
  service?: FriendService;
  serviceDeps?: FriendServiceDeps;
};

export function createAdminFriendHandlers({
  serviceDeps,
  service = createFriendService(serviceDeps),
}: FriendHandlerDeps = {}) {
  return {
    async handleListFriends(request: Request) {
      return withApiTiming(request, "admin.friends.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminFriendListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            category: url.searchParams.get("category") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listAdminFriends(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminFriend),
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
    async handleCreateFriend(request: Request) {
      return withApiTiming(request, "admin.friends.create", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminFriendCreateSchema.parse(await toJsonBody(request)),
        );
        const friend = await timing.time("service", async () => {
          const createdFriend = await service.createFriend(body);
          revalidatePublicFriendContent();

          return createdFriend;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminFriend(friend), undefined, 201),
        );
      });
    },
    async handleGetFriend(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.friends.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminFriendIdParamsSchema.parse(await params),
        );
        const friend = await timing.time("service", () =>
          service.getAdminFriend(id),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminFriend(friend)),
        );
      });
    },
    async handleUpdateFriend(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.friends.update", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id, body } = await timing.time("parse", async () => ({
          ...adminFriendIdParamsSchema.parse(await params),
          body: adminFriendUpdateSchema.parse(await toJsonBody(request)),
        }));
        const friend = await timing.time("service", async () => {
          const updatedFriend = await service.updateFriend(id, body);
          revalidatePublicFriendContent();

          return updatedFriend;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminFriend(friend)),
        );
      });
    },
    async handleDeleteFriend(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.friends.delete", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminFriendIdParamsSchema.parse(await params),
        );
        await timing.time("service", async () => {
          await service.deleteFriend(id);
          revalidatePublicFriendContent();
        });

        return timing.timeSync("response", () => createSuccessResponse(null));
      });
    },
  };
}

export function createPublicFriendHandlers({
  serviceDeps,
  service = createFriendService(serviceDeps),
}: FriendHandlerDeps = {}) {
  return {
    async handleListFriends(request?: Request) {
      return withApiTiming(request, "public.friends.list", async (timing) => {
        const friends = await timing.time("service", () =>
          service.listPublicFriends(),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse({
            items: friends.map(toPublicFriend),
          }),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminFriendHandlers();
const defaultPublicHandlers = createPublicFriendHandlers();

export const handleAdminListFriends = defaultAdminHandlers.handleListFriends;
export const handleAdminCreateFriend = defaultAdminHandlers.handleCreateFriend;
export const handleAdminGetFriend = defaultAdminHandlers.handleGetFriend;
export const handleAdminUpdateFriend = defaultAdminHandlers.handleUpdateFriend;
export const handleAdminDeleteFriend = defaultAdminHandlers.handleDeleteFriend;

export const handlePublicListFriends = defaultPublicHandlers.handleListFriends;
