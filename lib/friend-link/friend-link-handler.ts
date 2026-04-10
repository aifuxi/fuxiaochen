import { successResponse } from "@/lib/api/response";
import type { FriendLinkService } from "@/lib/friend-link/friend-link-service";
import type {
  CreateFriendLinkInput,
  ListFriendLinksQuery,
  UpdateFriendLinkInput,
} from "@/lib/friend-link/friend-link-dto";
import {
  createFriendLinkBodySchema,
  friendLinkIdSchema,
  listFriendLinksQuerySchema,
  updateFriendLinkBodySchema,
} from "@/lib/friend-link/friend-link-dto";

type FriendLinkHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: FriendLinkService;
};

type FriendLinkRouteParams = {
  id: string;
};

type ListFriendLinksResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FriendLinkHandler = {
  createFriendLink: (request: Request) => Promise<Response>;
  deleteFriendLink: (request: Request, params: FriendLinkRouteParams) => Promise<Response>;
  getFriendLink: (request: Request, params: FriendLinkRouteParams) => Promise<Response>;
  listFriendLinks: (request: Request) => Promise<Response>;
  updateFriendLink: (request: Request, params: FriendLinkRouteParams) => Promise<Response>;
};

export function createFriendLinkHandler(dependencies: FriendLinkHandlerDependencies): FriendLinkHandler {
  return {
    async createFriendLink(request) {
      await dependencies.requireSession(request);

      const input = createFriendLinkBodySchema.parse(await parseJsonBody<CreateFriendLinkInput>(request));
      const friendLink = await dependencies.service.createFriendLink(input);

      return successResponse(friendLink, {
        message: "Friend link created successfully.",
        status: 201,
      });
    },
    async deleteFriendLink(request, params) {
      await dependencies.requireSession(request);

      const id = friendLinkIdSchema.parse(params.id);
      const deletedFriendLink = await dependencies.service.deleteFriendLink(id);

      return successResponse(deletedFriendLink, {
        message: "Friend link deleted successfully.",
      });
    },
    async getFriendLink(request, params) {
      await dependencies.requireSession(request);

      const id = friendLinkIdSchema.parse(params.id);
      const friendLink = await dependencies.service.getFriendLinkById(id);

      return successResponse(friendLink, {
        message: "Friend link fetched successfully.",
      });
    },
    async listFriendLinks(request) {
      await dependencies.requireSession(request);

      const query = parseListFriendLinksQuery(request);
      const result = await dependencies.service.listFriendLinks(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Friend links fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListFriendLinksResponseMeta,
        },
      );
    },
    async updateFriendLink(request, params) {
      await dependencies.requireSession(request);

      const id = friendLinkIdSchema.parse(params.id);
      const input = updateFriendLinkBodySchema.parse(await parseJsonBody<UpdateFriendLinkInput>(request));
      const friendLink = await dependencies.service.updateFriendLink(id, input);

      return successResponse(friendLink, {
        message: "Friend link updated successfully.",
      });
    },
  };
}

function parseListFriendLinksQuery(request: Request): ListFriendLinksQuery {
  const { searchParams } = new URL(request.url);

  return listFriendLinksQuerySchema.parse({
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
