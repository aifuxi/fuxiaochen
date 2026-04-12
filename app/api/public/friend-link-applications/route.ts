import { handleRoute } from "@/lib/api/handle-route";
import { createPublicContentHandler } from "@/lib/public/public-content-handler";
import { createPublicContentRepository } from "@/lib/public/public-content-repository";
import { createPublicContentService } from "@/lib/public/public-content-service";

const publicContentHandler = createPublicContentHandler({
  service: createPublicContentService(createPublicContentRepository()),
});

export const POST = handleRoute(async (request: Request) => publicContentHandler.createFriendLinkApplication(request));
