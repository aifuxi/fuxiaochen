import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  tagCreateSchema,
  tagIdParamsSchema,
  tagListQuerySchema,
  tagUpdateSchema,
} from "./dto";
import { createTagService, type TagService, type TagServiceDeps } from "./service";

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

type TagHandlerDeps = {
  service?: TagService;
  serviceDeps?: TagServiceDeps;
};

export function createTagHandlers({
  serviceDeps,
  service = createTagService(serviceDeps),
}: TagHandlerDeps = {}) {
  return {
    async handleListTags(request: Request) {
      try {
        const url = new URL(request.url);
        const query = tagListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listTags(query);

        return createSuccessResponse(
          {
            items: result.items,
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
    async handleCreateTag(request: Request) {
      try {
        const body = tagCreateSchema.parse(await toJsonBody(request));
        const tag = await service.createTag(body);

        return createSuccessResponse(tag, undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetTag(_request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = tagIdParamsSchema.parse(await params);
        const tag = await service.getTag(id);

        return createSuccessResponse(tag);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateTag(request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = tagIdParamsSchema.parse(await params);
        const body = tagUpdateSchema.parse(await toJsonBody(request));
        const tag = await service.updateTag(id, body);

        return createSuccessResponse(tag);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteTag(_request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = tagIdParamsSchema.parse(await params);
        await service.deleteTag(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultHandlers = createTagHandlers();

export const handleListTags = defaultHandlers.handleListTags;
export const handleCreateTag = defaultHandlers.handleCreateTag;
export const handleGetTag = defaultHandlers.handleGetTag;
export const handleUpdateTag = defaultHandlers.handleUpdateTag;
export const handleDeleteTag = defaultHandlers.handleDeleteTag;
