import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicTagContent } from "@/lib/server/public-content-cache";

import {
  adminTagCreateSchema,
  adminTagIdParamsSchema,
  adminTagListQuerySchema,
  adminTagUpdateSchema,
} from "./dto";
import { toAdminTag, toPublicTag } from "./mappers";
import {
  createTagService,
  type TagService,
  type TagServiceDeps,
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

type TagHandlerDeps = {
  service?: TagService;
  serviceDeps?: TagServiceDeps;
};

export function createAdminTagHandlers({
  serviceDeps,
  service = createTagService(serviceDeps),
}: TagHandlerDeps = {}) {
  return {
    async handleListTags(request: Request) {
      try {
        await requireRequestSession(request);

        const url = new URL(request.url);
        const query = adminTagListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          includeCounts: url.searchParams.get("includeCounts") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminTags(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminTag),
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
        await requireAdminRequestSession(request);

        const body = adminTagCreateSchema.parse(await toJsonBody(request));
        const tag = await service.createTag(body);

        revalidatePublicTagContent();

        return createSuccessResponse(toAdminTag(tag), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetTag(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireRequestSession(request);

        const { id } = adminTagIdParamsSchema.parse(await params);
        const tag = await service.getTag(id);

        return createSuccessResponse(toAdminTag(tag));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateTag(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminTagIdParamsSchema.parse(await params);
        const body = adminTagUpdateSchema.parse(await toJsonBody(request));
        const tag = await service.updateTag(id, body);

        revalidatePublicTagContent();

        return createSuccessResponse(toAdminTag(tag));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteTag(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminTagIdParamsSchema.parse(await params);
        await service.deleteTag(id);

        revalidatePublicTagContent();

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicTagHandlers({
  serviceDeps,
  service = createTagService(serviceDeps),
}: TagHandlerDeps = {}) {
  return {
    async handleListTags() {
      try {
        const tags = await service.listPublicTags();

        return createSuccessResponse({
          items: tags.map(toPublicTag),
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminTagHandlers();
const defaultPublicHandlers = createPublicTagHandlers();

export const handleAdminListTags = defaultAdminHandlers.handleListTags;
export const handleAdminCreateTag = defaultAdminHandlers.handleCreateTag;
export const handleAdminGetTag = defaultAdminHandlers.handleGetTag;
export const handleAdminUpdateTag = defaultAdminHandlers.handleUpdateTag;
export const handleAdminDeleteTag = defaultAdminHandlers.handleDeleteTag;

export const handlePublicListTags = defaultPublicHandlers.handleListTags;
