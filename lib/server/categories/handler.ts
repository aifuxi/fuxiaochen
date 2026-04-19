import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  categoryCreateSchema,
  categoryIdParamsSchema,
  categoryListQuerySchema,
  categoryUpdateSchema,
} from "./dto";
import {
  createCategoryService,
  type CategoryService,
  type CategoryServiceDeps,
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

type CategoryHandlerDeps = {
  service?: CategoryService;
  serviceDeps?: CategoryServiceDeps;
};

export function createCategoryHandlers({
  serviceDeps,
  service = createCategoryService(serviceDeps),
}: CategoryHandlerDeps = {}) {
  return {
    async handleListCategories(request: Request) {
      try {
        const url = new URL(request.url);
        const query = categoryListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listCategories(query);

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
    async handleCreateCategory(request: Request) {
      try {
        const body = categoryCreateSchema.parse(await toJsonBody(request));
        const category = await service.createCategory(body);

        return createSuccessResponse(category, undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetCategory(_request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = categoryIdParamsSchema.parse(await params);
        const category = await service.getCategory(id);

        return createSuccessResponse(category);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateCategory(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = categoryIdParamsSchema.parse(await params);
        const body = categoryUpdateSchema.parse(await toJsonBody(request));
        const category = await service.updateCategory(id, body);

        return createSuccessResponse(category);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteCategory(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = categoryIdParamsSchema.parse(await params);
        await service.deleteCategory(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultHandlers = createCategoryHandlers();

export const handleListCategories = defaultHandlers.handleListCategories;
export const handleCreateCategory = defaultHandlers.handleCreateCategory;
export const handleGetCategory = defaultHandlers.handleGetCategory;
export const handleUpdateCategory = defaultHandlers.handleUpdateCategory;
export const handleDeleteCategory = defaultHandlers.handleDeleteCategory;
