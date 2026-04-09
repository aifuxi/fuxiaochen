import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createArticleHandler } from "@/lib/article/article-handler";
import { createArticleRepository } from "@/lib/article/article-repository";
import { createArticleService } from "@/lib/article/article-service";

const articleHandler = createArticleHandler({
  requireSession: requireApiSession,
  service: createArticleService(createArticleRepository()),
});

export const GET = handleRoute(async (request: Request) => articleHandler.listArticles(request));

export const POST = handleRoute(async (request: Request) => articleHandler.createArticle(request));
