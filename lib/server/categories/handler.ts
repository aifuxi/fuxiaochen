import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicCategoryContent } from "@/lib/server/public-content-cache";

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
      return withApiTiming(request, "admin.categories.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminCategoryListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            includeCounts: url.searchParams.get("includeCounts") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listAdminCategories(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminCategory),
            },
            {
              page: query.page,
              pageSize: query.pageSize,
              total: result.total,
            },
          ),
        );
      });
    },
    async handleCreateCategory(request: Request) {
      return withApiTiming(
        request,
        "admin.categories.create",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const body = await timing.time("parse", async () =>
            adminCategoryCreateSchema.parse(await toJsonBody(request)),
          );
          const category = await timing.time("service", async () => {
            const createdCategory = await service.createCategory(body);
            revalidatePublicCategoryContent();

            return createdCategory;
          });

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminCategory(category), undefined, 201),
          );
        },
      );
    },
    async handleGetCategory(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.categories.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminCategoryIdParamsSchema.parse(await params),
        );
        const category = await timing.time("service", () =>
          service.getCategory(id),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminCategory(category)),
        );
      });
    },
    async handleUpdateCategory(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.categories.update",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const { id, body } = await timing.time("parse", async () => ({
            ...adminCategoryIdParamsSchema.parse(await params),
            body: adminCategoryUpdateSchema.parse(await toJsonBody(request)),
          }));
          const category = await timing.time("service", async () => {
            const updatedCategory = await service.updateCategory(id, body);
            revalidatePublicCategoryContent();

            return updatedCategory;
          });

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminCategory(category)),
          );
        },
      );
    },
    async handleDeleteCategory(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.categories.delete",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const { id } = await timing.time("parse", async () =>
            adminCategoryIdParamsSchema.parse(await params),
          );
          await timing.time("service", async () => {
            await service.deleteCategory(id);
            revalidatePublicCategoryContent();
          });

          return timing.timeSync("response", () => createSuccessResponse(null));
        },
      );
    },
  };
}

export function createPublicCategoryHandlers({
  serviceDeps,
  service = createCategoryService(serviceDeps),
}: CategoryHandlerDeps = {}) {
  return {
    async handleListCategories(request?: Request) {
      return withApiTiming(
        request,
        "public.categories.list",
        async (timing) => {
          const categories = await timing.time("service", () =>
            service.listPublicCategories(),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse({
              items: categories.map(toPublicCategory),
            }),
          );
        },
      );
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
