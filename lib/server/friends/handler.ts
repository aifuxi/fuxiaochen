import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
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
      try {
        await requireRequestSession(request);

        const url = new URL(request.url);
        const query = adminFriendListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          category: url.searchParams.get("category") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminFriends(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminFriend),
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
    async handleCreateFriend(request: Request) {
      try {
        await requireAdminRequestSession(request);

        const body = adminFriendCreateSchema.parse(await toJsonBody(request));
        const friend = await service.createFriend(body);

        revalidatePublicFriendContent();

        return createSuccessResponse(toAdminFriend(friend), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetFriend(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireRequestSession(request);

        const { id } = adminFriendIdParamsSchema.parse(await params);
        const friend = await service.getAdminFriend(id);

        return createSuccessResponse(toAdminFriend(friend));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateFriend(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminFriendIdParamsSchema.parse(await params);
        const body = adminFriendUpdateSchema.parse(await toJsonBody(request));
        const friend = await service.updateFriend(id, body);

        revalidatePublicFriendContent();

        return createSuccessResponse(toAdminFriend(friend));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteFriend(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminFriendIdParamsSchema.parse(await params);
        await service.deleteFriend(id);

        revalidatePublicFriendContent();

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicFriendHandlers({
  serviceDeps,
  service = createFriendService(serviceDeps),
}: FriendHandlerDeps = {}) {
  return {
    async handleListFriends() {
      try {
        const friends = await service.listPublicFriends();

        return createSuccessResponse({
          items: friends.map(toPublicFriend),
        });
      } catch (error) {
        return toErrorResponse(error);
      }
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
