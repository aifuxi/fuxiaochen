import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createArticleHandler } from "@/lib/article/article-handler";
import { createArticleRepository } from "@/lib/article/article-repository";
import { createArticleService } from "@/lib/article/article-service";

const articleHandler = createArticleHandler({
  requireSession: requireApiSession,
  service: createArticleService(createArticleRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  articleHandler.getArticle(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  articleHandler.updateArticle(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  articleHandler.deleteArticle(request, await context.params),
);
