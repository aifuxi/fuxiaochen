import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  adminCategoryCreateSchema,
  adminCategoryIdParamsSchema,
  adminCategoryListQuerySchema,
  adminCategoryUpdateSchema,
} from "./dto";
import { toAdminCategory, toPublicCategory } from "./mappers";
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

export function createAdminCategoryHandlers({
  serviceDeps,
  service = createCategoryService(serviceDeps),
}: CategoryHandlerDeps = {}) {
  return {
    async handleListCategories(request: Request) {
      try {
        const url = new URL(request.url);
        const query = adminCategoryListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          includeCounts: url.searchParams.get("includeCounts") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminCategories(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminCategory),
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
        const body = adminCategoryCreateSchema.parse(await toJsonBody(request));
        const category = await service.createCategory(body);

        return createSuccessResponse(toAdminCategory(category), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetCategory(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = adminCategoryIdParamsSchema.parse(await params);
        const category = await service.getCategory(id);

        return createSuccessResponse(toAdminCategory(category));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateCategory(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = adminCategoryIdParamsSchema.parse(await params);
        const body = adminCategoryUpdateSchema.parse(await toJsonBody(request));
        const category = await service.updateCategory(id, body);

        return createSuccessResponse(toAdminCategory(category));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteCategory(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = adminCategoryIdParamsSchema.parse(await params);
        await service.deleteCategory(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicCategoryHandlers({
  serviceDeps,
  service = createCategoryService(serviceDeps),
}: CategoryHandlerDeps = {}) {
  return {
    async handleListCategories() {
      try {
        const categories = await service.listPublicCategories();

        return createSuccessResponse({
          items: categories.map(toPublicCategory),
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminCategoryHandlers();
const defaultPublicHandlers = createPublicCategoryHandlers();

export const handleAdminListCategories =
  defaultAdminHandlers.handleListCategories;
export const handleAdminCreateCategory =
  defaultAdminHandlers.handleCreateCategory;
export const handleAdminGetCategory = defaultAdminHandlers.handleGetCategory;
export const handleAdminUpdateCategory =
  defaultAdminHandlers.handleUpdateCategory;
export const handleAdminDeleteCategory =
  defaultAdminHandlers.handleDeleteCategory;

export const handlePublicListCategories =
  defaultPublicHandlers.handleListCategories;
