import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createTagHandler } from "@/lib/tag/tag-handler";
import { createTagRepository } from "@/lib/tag/tag-repository";
import { createTagService } from "@/lib/tag/tag-service";

const tagHandler = createTagHandler({
  requireSession: requireApiSession,
  service: createTagService(createTagRepository()),
});

export const GET = handleRoute(async (request: Request) => tagHandler.listTags(request));

export const POST = handleRoute(async (request: Request) => tagHandler.createTag(request));
