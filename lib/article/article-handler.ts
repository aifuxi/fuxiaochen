import { successResponse } from "@/lib/api/response";
import type { ArticleService } from "@/lib/article/article-service";
import type { CreateArticleInput, ListArticlesQuery, UpdateArticleInput } from "@/lib/article/article-dto";
import {
  articleIdSchema,
  createArticleBodySchema,
  listArticlesQuerySchema,
  updateArticleBodySchema,
} from "@/lib/article/article-dto";

type ArticleHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: ArticleService;
};

type ArticleRouteParams = {
  id: string;
};

type ListArticlesResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ArticleHandler = {
  createArticle: (request: Request) => Promise<Response>;
  deleteArticle: (request: Request, params: ArticleRouteParams) => Promise<Response>;
  getArticle: (request: Request, params: ArticleRouteParams) => Promise<Response>;
  listArticles: (request: Request) => Promise<Response>;
  updateArticle: (request: Request, params: ArticleRouteParams) => Promise<Response>;
};

export function createArticleHandler(dependencies: ArticleHandlerDependencies): ArticleHandler {
  return {
    async createArticle(request) {
      await dependencies.requireSession(request);

      const input = createArticleBodySchema.parse(await parseJsonBody<CreateArticleInput>(request));
      const article = await dependencies.service.createArticle(input);

      return successResponse(article, {
        message: "Article created successfully.",
        status: 201,
      });
    },
    async deleteArticle(request, params) {
      await dependencies.requireSession(request);

      const id = articleIdSchema.parse(params.id);
      const deletedArticle = await dependencies.service.deleteArticle(id);

      return successResponse(deletedArticle, {
        message: "Article deleted successfully.",
      });
    },
    async getArticle(request, params) {
      await dependencies.requireSession(request);

      const id = articleIdSchema.parse(params.id);
      const article = await dependencies.service.getArticleById(id);

      return successResponse(article, {
        message: "Article fetched successfully.",
      });
    },
    async listArticles(request) {
      await dependencies.requireSession(request);

      const query = parseListArticlesQuery(request);
      const result = await dependencies.service.listArticles(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Articles fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListArticlesResponseMeta,
        },
      );
    },
    async updateArticle(request, params) {
      await dependencies.requireSession(request);

      const id = articleIdSchema.parse(params.id);
      const input = updateArticleBodySchema.parse(await parseJsonBody<UpdateArticleInput>(request));
      const article = await dependencies.service.updateArticle(id, input);

      return successResponse(article, {
        message: "Article updated successfully.",
      });
    },
  };
}

function parseListArticlesQuery(request: Request): ListArticlesQuery {
  const { searchParams } = new URL(request.url);

  return listArticlesQuerySchema.parse({
    categoryId: searchParams.get("categoryId") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
