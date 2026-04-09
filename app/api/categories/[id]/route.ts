import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createCategoryHandler } from "@/lib/category/category-handler";
import { createCategoryRepository } from "@/lib/category/category-repository";
import { createCategoryService } from "@/lib/category/category-service";

const categoryHandler = createCategoryHandler({
  requireSession: requireApiSession,
  service: createCategoryService(createCategoryRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  categoryHandler.getCategory(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  categoryHandler.updateCategory(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  categoryHandler.deleteCategory(request, await context.params),
);
