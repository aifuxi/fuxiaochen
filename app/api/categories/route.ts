import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createCategoryHandler } from "@/lib/category/category-handler";
import { createCategoryRepository } from "@/lib/category/category-repository";
import { createCategoryService } from "@/lib/category/category-service";

const categoryHandler = createCategoryHandler({
  requireSession: requireApiSession,
  service: createCategoryService(createCategoryRepository()),
});

export const GET = handleRoute(async (request: Request) => categoryHandler.listCategories(request));

export const POST = handleRoute(async (request: Request) => categoryHandler.createCategory(request));
