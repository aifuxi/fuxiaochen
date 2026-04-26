import {
  getSessionUserRole,
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  adminBlogCreateSchema,
  adminBlogIdParamsSchema,
  adminBlogListQuerySchema,
  adminBlogSlugParamsSchema,
  adminBlogUpdateSchema,
  publicBlogListQuerySchema,
  publicBlogSlugParamsSchema,
  publicSimilarBlogQuerySchema,
} from "./dto";
import { toAdminBlog, toPublicBlog } from "./mappers";
import {
  createBlogService,
  type BlogService,
  type BlogServiceDeps,
} from "./service";
import {
  applyBlogStatsVisitorCookie,
  blogStatsService,
  DEFAULT_BLOG_STATS,
  ensureBlogStatsVisitor,
  getBlogStatsVisitorId,
  type BlogStats,
  type BlogStatsService,
} from "./stats";

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

type BlogHandlerDeps = {
  service?: BlogService;
  serviceDeps?: BlogServiceDeps;
  statsService?: BlogStatsService;
};

const getBlogStats = async (
  statsService: BlogStatsService,
  blogIds: string[],
  visitorId?: string | null,
) => {
  try {
    return await statsService.getStatsByBlogIds(blogIds, visitorId);
  } catch {
    return new Map<string, BlogStats>();
  }
};

const resolveBlogStats = (
  statsByBlogId: Map<string, BlogStats>,
  blogId: string,
) => statsByBlogId.get(blogId) ?? DEFAULT_BLOG_STATS;

export function createAdminBlogHandlers({
  serviceDeps,
  service = createBlogService(serviceDeps),
}: BlogHandlerDeps = {}) {
  return {
    async handleListBlogs(request: Request) {
      try {
        const session = await requireRequestSession(request);
        const isAdmin = getSessionUserRole(session) === "admin";
        const url = new URL(request.url);
        const query = adminBlogListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          categoryId: url.searchParams.get("categoryId") ?? undefined,
          tagId: url.searchParams.get("tagId") ?? undefined,
          featured: url.searchParams.get("featured") ?? undefined,
          published: url.searchParams.get("published") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminBlogs(
          isAdmin ? query : { ...query, published: true },
        );

        return createSuccessResponse(
          {
            items: result.items.map(toAdminBlog),
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
    async handleCreateBlog(request: Request) {
      try {
        await requireAdminRequestSession(request);

        const body = adminBlogCreateSchema.parse(await toJsonBody(request));
        const blog = await service.createBlog(body);

        return createSuccessResponse(toAdminBlog(blog), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetBlog(request: Request, params: Promise<{ id: string }>) {
      try {
        const session = await requireRequestSession(request);
        const { id } = adminBlogIdParamsSchema.parse(await params);
        const blog = await service.getAdminBlog(id);

        if (getSessionUserRole(session) !== "admin" && !blog.published) {
          throw new AppError(
            ERROR_CODES.BLOG_NOT_FOUND,
            "Blog not found",
            404,
            {
              id,
            },
          );
        }

        return createSuccessResponse(toAdminBlog(blog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetBlogBySlug(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { slug } = adminBlogSlugParamsSchema.parse(await params);
        const blog = await service.getAdminBlogBySlug(slug);

        return createSuccessResponse(toAdminBlog(blog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateBlog(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminBlogIdParamsSchema.parse(await params);
        const body = adminBlogUpdateSchema.parse(await toJsonBody(request));
        const blog = await service.updateBlog(id, body);

        return createSuccessResponse(toAdminBlog(blog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteBlog(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminBlogIdParamsSchema.parse(await params);
        await service.deleteBlog(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicBlogHandlers({
  serviceDeps,
  service = createBlogService(serviceDeps),
  statsService = blogStatsService,
}: BlogHandlerDeps = {}) {
  return {
    async handleListBlogs(request: Request) {
      try {
        const url = new URL(request.url);
        const query = publicBlogListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          category: url.searchParams.get("category") ?? undefined,
          tag: url.searchParams.get("tag") ?? undefined,
          featured: url.searchParams.get("featured") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listPublicBlogs(query);
        const statsByBlogId = await getBlogStats(
          statsService,
          result.items.map((blog) => blog.id),
          getBlogStatsVisitorId(request),
        );

        return createSuccessResponse(
          {
            items: result.items.map((blog) =>
              toPublicBlog(blog, resolveBlogStats(statsByBlogId, blog.id)),
            ),
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
    async handleGetBlog(request: Request, params: Promise<{ slug: string }>) {
      try {
        const { slug } = publicBlogSlugParamsSchema.parse(await params);
        const blog = await service.getPublicBlogBySlug(slug);
        const statsByBlogId = await getBlogStats(
          statsService,
          [blog.id],
          getBlogStatsVisitorId(request),
        );

        return createSuccessResponse(
          toPublicBlog(blog, resolveBlogStats(statsByBlogId, blog.id)),
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleListSimilarBlogs(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      try {
        const { slug } = publicBlogSlugParamsSchema.parse(await params);
        const url = new URL(request.url);
        const query = publicSimilarBlogQuerySchema.parse({
          limit: url.searchParams.get("limit") ?? undefined,
        });
        const items = await service.getPublicSimilarBlogs(slug, query.limit);
        const statsByBlogId = await getBlogStats(
          statsService,
          items.map((blog) => blog.id),
          getBlogStatsVisitorId(request),
        );

        return createSuccessResponse({
          items: items.map((blog) =>
            toPublicBlog(blog, resolveBlogStats(statsByBlogId, blog.id)),
          ),
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleTrackBlogView(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      try {
        const { slug } = publicBlogSlugParamsSchema.parse(await params);
        const blog = await service.getPublicBlogBySlug(slug);
        const visitor = ensureBlogStatsVisitor(request);
        const result = await statsService.trackView(blog.id, visitor.visitorId);

        return applyBlogStatsVisitorCookie(
          createSuccessResponse(result),
          visitor,
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleToggleBlogLike(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      try {
        const { slug } = publicBlogSlugParamsSchema.parse(await params);
        const blog = await service.getPublicBlogBySlug(slug);
        const visitor = ensureBlogStatsVisitor(request);
        const result = await statsService.toggleLike(
          blog.id,
          visitor.visitorId,
        );

        return applyBlogStatsVisitorCookie(
          createSuccessResponse(result),
          visitor,
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminBlogHandlers();
const defaultPublicHandlers = createPublicBlogHandlers();

export const handleAdminListBlogs = defaultAdminHandlers.handleListBlogs;
export const handleAdminCreateBlog = defaultAdminHandlers.handleCreateBlog;
export const handleAdminGetBlog = defaultAdminHandlers.handleGetBlog;
export const handleAdminGetBlogBySlug =
  defaultAdminHandlers.handleGetBlogBySlug;
export const handleAdminUpdateBlog = defaultAdminHandlers.handleUpdateBlog;
export const handleAdminDeleteBlog = defaultAdminHandlers.handleDeleteBlog;

export const handlePublicListBlogs = defaultPublicHandlers.handleListBlogs;
export const handlePublicGetBlog = defaultPublicHandlers.handleGetBlog;
export const handlePublicListSimilarBlogs =
  defaultPublicHandlers.handleListSimilarBlogs;
export const handlePublicTrackBlogView =
  defaultPublicHandlers.handleTrackBlogView;
export const handlePublicToggleBlogLike =
  defaultPublicHandlers.handleToggleBlogLike;
