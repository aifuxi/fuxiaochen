import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createTagHandler } from "@/lib/tag/tag-handler";
import { createTagRepository } from "@/lib/tag/tag-repository";
import { createTagService } from "@/lib/tag/tag-service";

const tagHandler = createTagHandler({
  requireSession: requireApiSession,
  service: createTagService(createTagRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  tagHandler.getTag(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  tagHandler.updateTag(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  tagHandler.deleteTag(request, await context.params),
);
