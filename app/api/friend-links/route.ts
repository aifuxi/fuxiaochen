import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createFriendLinkHandler } from "@/lib/friend-link/friend-link-handler";
import { createFriendLinkRepository } from "@/lib/friend-link/friend-link-repository";
import { createFriendLinkService } from "@/lib/friend-link/friend-link-service";

const friendLinkHandler = createFriendLinkHandler({
  requireSession: requireApiSession,
  service: createFriendLinkService(createFriendLinkRepository()),
});

export const GET = handleRoute(async (request: Request) => friendLinkHandler.listFriendLinks(request));

export const POST = handleRoute(async (request: Request) => friendLinkHandler.createFriendLink(request));
