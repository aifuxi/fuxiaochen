import { handleRoute } from "@/lib/api/handle-route";
import { createPublicContentHandler } from "@/lib/public/public-content-handler";
import { createPublicContentRepository } from "@/lib/public/public-content-repository";
import { createPublicContentService } from "@/lib/public/public-content-service";

const publicContentHandler = createPublicContentHandler({
  service: createPublicContentService(createPublicContentRepository()),
});

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  publicContentHandler.getArticle(request, await context.params),
);
