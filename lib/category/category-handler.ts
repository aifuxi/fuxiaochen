import { successResponse } from "@/lib/api/response";
import type { CategoryService } from "@/lib/category/category-service";
import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from "@/lib/category/category-dto";
import {
  categoryIdSchema,
  createCategoryBodySchema,
  listCategoriesQuerySchema,
  updateCategoryBodySchema,
} from "@/lib/category/category-dto";

type CategoryHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: CategoryService;
};

type CategoryRouteParams = {
  id: string;
};

type ListCategoriesResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CategoryHandler = {
  createCategory: (request: Request) => Promise<Response>;
  deleteCategory: (request: Request, params: CategoryRouteParams) => Promise<Response>;
  getCategory: (request: Request, params: CategoryRouteParams) => Promise<Response>;
  listCategories: (request: Request) => Promise<Response>;
  updateCategory: (request: Request, params: CategoryRouteParams) => Promise<Response>;
};

export function createCategoryHandler(dependencies: CategoryHandlerDependencies): CategoryHandler {
  return {
    async createCategory(request) {
      await dependencies.requireSession(request);

      const input = createCategoryBodySchema.parse(await parseJsonBody<CreateCategoryInput>(request));
      const category = await dependencies.service.createCategory(input);

      return successResponse(category, {
        message: "Category created successfully.",
        status: 201,
      });
    },
    async deleteCategory(request, params) {
      await dependencies.requireSession(request);

      const id = categoryIdSchema.parse(params.id);
      const deletedCategory = await dependencies.service.deleteCategory(id);

      return successResponse(deletedCategory, {
        message: "Category deleted successfully.",
      });
    },
    async getCategory(request, params) {
      await dependencies.requireSession(request);

      const id = categoryIdSchema.parse(params.id);
      const category = await dependencies.service.getCategoryById(id);

      return successResponse(category, {
        message: "Category fetched successfully.",
      });
    },
    async listCategories(request) {
      await dependencies.requireSession(request);

      const query = parseListCategoriesQuery(request);
      const result = await dependencies.service.listCategories(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Categories fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListCategoriesResponseMeta,
        },
      );
    },
    async updateCategory(request, params) {
      await dependencies.requireSession(request);

      const id = categoryIdSchema.parse(params.id);
      const input = updateCategoryBodySchema.parse(await parseJsonBody<UpdateCategoryInput>(request));
      const category = await dependencies.service.updateCategory(id, input);

      return successResponse(category, {
        message: "Category updated successfully.",
      });
    },
  };
}

function parseListCategoriesQuery(request: Request): ListCategoriesQuery {
  const { searchParams } = new URL(request.url);

  return listCategoriesQuerySchema.parse({
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
