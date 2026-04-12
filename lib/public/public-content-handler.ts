import { successResponse } from "@/lib/api/response";
import type { PublicContentService } from "@/lib/public/public-content-service";
import type {
  CreateFriendLinkApplicationInput,
  PublicListArticlesQuery,
  PublicListChangelogQuery,
  PublicListFriendLinksQuery,
  PublicListProjectsQuery,
} from "@/lib/public/public-content-dto";
import {
  createFriendLinkApplicationBodySchema,
  publicArticleSlugSchema,
  publicListArticlesQuerySchema,
  publicListChangelogQuerySchema,
  publicListFriendLinksQuerySchema,
  publicListProjectsQuerySchema,
} from "@/lib/public/public-content-dto";

type PublicContentHandlerDependencies = {
  service: PublicContentService;
};

type ArticleRouteParams = {
  slug: string;
};

type ListResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PublicContentHandler = {
  createFriendLinkApplication: (request: Request) => Promise<Response>;
  getArticle: (request: Request, params: ArticleRouteParams) => Promise<Response>;
  getSite: (request: Request) => Promise<Response>;
  listArticles: (request: Request) => Promise<Response>;
  listChangelog: (request: Request) => Promise<Response>;
  listFriendLinks: (request: Request) => Promise<Response>;
  listProjects: (request: Request) => Promise<Response>;
};

export function createPublicContentHandler({ service }: PublicContentHandlerDependencies): PublicContentHandler {
  return {
    async createFriendLinkApplication(request) {
      const input = createFriendLinkApplicationBodySchema.parse(
        await parseJsonBody<CreateFriendLinkApplicationInput>(request),
      );
      const application = await service.createFriendLinkApplication(input);

      return successResponse(application, {
        message: "Friend link application submitted successfully.",
        status: 201,
      });
    },
    async getArticle(_request, params) {
      const slug = publicArticleSlugSchema.parse(params.slug);
      const article = await service.getArticleBySlug(slug);

      return successResponse(article, {
        message: "Article fetched successfully.",
      });
    },
    async getSite() {
      const site = await service.getSite();

      return successResponse(site, {
        message: "Site data fetched successfully.",
      });
    },
    async listArticles(request) {
      const query = parseListArticlesQuery(request);
      const result = await service.listArticles(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Articles fetched successfully.",
          meta: toMeta(result),
        },
      );
    },
    async listChangelog(request) {
      const query = parseListChangelogQuery(request);
      const result = await service.listChangelog(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Changelog fetched successfully.",
          meta: toMeta(result),
        },
      );
    },
    async listFriendLinks(request) {
      const query = parseListFriendLinksQuery(request);
      const result = await service.listFriendLinks(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Friend links fetched successfully.",
          meta: toMeta(result),
        },
      );
    },
    async listProjects(request) {
      const query = parseListProjectsQuery(request);
      const result = await service.listProjects(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Projects fetched successfully.",
          meta: toMeta(result),
        },
      );
    },
  };
}

function parseListArticlesQuery(request: Request): PublicListArticlesQuery {
  const { searchParams } = new URL(request.url);

  return publicListArticlesQuerySchema.parse({
    categorySlug: searchParams.get("categorySlug") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

function parseListProjectsQuery(request: Request): PublicListProjectsQuery {
  const { searchParams } = new URL(request.url);

  return publicListProjectsQuerySchema.parse({
    category: searchParams.get("category") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

function parseListFriendLinksQuery(request: Request): PublicListFriendLinksQuery {
  const { searchParams } = new URL(request.url);

  return publicListFriendLinksQuerySchema.parse({
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

function parseListChangelogQuery(request: Request): PublicListChangelogQuery {
  const { searchParams } = new URL(request.url);

  return publicListChangelogQuerySchema.parse({
    isMajor: searchParams.get("isMajor") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

function toMeta(result: ListResponseMeta): ListResponseMeta {
  return {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  };
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
