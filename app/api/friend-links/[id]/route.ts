import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createFriendLinkHandler } from "@/lib/friend-link/friend-link-handler";
import { createFriendLinkRepository } from "@/lib/friend-link/friend-link-repository";
import { createFriendLinkService } from "@/lib/friend-link/friend-link-service";

const friendLinkHandler = createFriendLinkHandler({
  requireSession: requireApiSession,
  service: createFriendLinkService(createFriendLinkRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  friendLinkHandler.getFriendLink(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  friendLinkHandler.updateFriendLink(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  friendLinkHandler.deleteFriendLink(request, await context.params),
);
