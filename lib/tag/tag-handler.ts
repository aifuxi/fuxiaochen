import type { CreateTagInput, ListTagsQuery, UpdateTagInput } from "@/lib/tag/tag-dto";
import {
  createTagBodySchema,
  listTagsQuerySchema,
  tagIdSchema,
  updateTagBodySchema,
} from "@/lib/tag/tag-dto";
import { successResponse } from "@/lib/api/response";
import type { TagService } from "@/lib/tag/tag-service";

type TagHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: TagService;
};

type TagRouteParams = {
  id: string;
};

type ListTagsResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TagHandler = {
  createTag: (request: Request) => Promise<Response>;
  deleteTag: (request: Request, params: TagRouteParams) => Promise<Response>;
  getTag: (request: Request, params: TagRouteParams) => Promise<Response>;
  listTags: (request: Request) => Promise<Response>;
  updateTag: (request: Request, params: TagRouteParams) => Promise<Response>;
};

export function createTagHandler(dependencies: TagHandlerDependencies): TagHandler {
  return {
    async createTag(request) {
      await dependencies.requireSession(request);

      const input = createTagBodySchema.parse(await parseJsonBody<CreateTagInput>(request));
      const tag = await dependencies.service.createTag(input);

      return successResponse(tag, {
        message: "Tag created successfully.",
        status: 201,
      });
    },
    async deleteTag(request, params) {
      await dependencies.requireSession(request);

      const id = tagIdSchema.parse(params.id);
      const deletedTag = await dependencies.service.deleteTag(id);

      return successResponse(deletedTag, {
        message: "Tag deleted successfully.",
      });
    },
    async getTag(request, params) {
      await dependencies.requireSession(request);

      const id = tagIdSchema.parse(params.id);
      const tag = await dependencies.service.getTagById(id);

      return successResponse(tag, {
        message: "Tag fetched successfully.",
      });
    },
    async listTags(request) {
      await dependencies.requireSession(request);

      const query = parseListTagsQuery(request);
      const result = await dependencies.service.listTags(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Tags fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListTagsResponseMeta,
        },
      );
    },
    async updateTag(request, params) {
      await dependencies.requireSession(request);

      const id = tagIdSchema.parse(params.id);
      const input = updateTagBodySchema.parse(await parseJsonBody<UpdateTagInput>(request));
      const tag = await dependencies.service.updateTag(id, input);

      return successResponse(tag, {
        message: "Tag updated successfully.",
      });
    },
  };
}

function parseListTagsQuery(request: Request): ListTagsQuery {
  const { searchParams } = new URL(request.url);

  return listTagsQuerySchema.parse({
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
