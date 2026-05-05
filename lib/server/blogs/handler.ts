import {
  getSessionUserRole,
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicBlogContent } from "@/lib/server/public-content-cache";

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
      return withApiTiming(request, "admin.blogs.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);
        const isAdmin = getSessionUserRole(session) === "admin";

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminBlogListQuerySchema.parse({
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
        });
        const result = await timing.time("service", () =>
          service.listAdminBlogs(
            isAdmin ? query : { ...query, published: true },
          ),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminBlog),
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
    async handleCreateBlog(request: Request) {
      return withApiTiming(request, "admin.blogs.create", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminBlogCreateSchema.parse(await toJsonBody(request)),
        );
        const blog = await timing.time("service", async () => {
          const createdBlog = await service.createBlog(body);
          revalidatePublicBlogContent();

          return createdBlog;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminBlog(blog), undefined, 201),
        );
      });
    },
    async handleGetBlog(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.blogs.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminBlogIdParamsSchema.parse(await params),
        );
        const blog = await timing.time("service", async () => {
          const loadedBlog = await service.getAdminBlog(id);

          if (
            getSessionUserRole(session) !== "admin" &&
            !loadedBlog.published
          ) {
            throw new AppError(
              ERROR_CODES.BLOG_NOT_FOUND,
              "Blog not found",
              404,
              {
                id,
              },
            );
          }

          return loadedBlog;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminBlog(blog)),
        );
      });
    },
    async handleGetBlogBySlug(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.blogs.get-by-slug",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const { slug } = await timing.time("parse", async () =>
            adminBlogSlugParamsSchema.parse(await params),
          );
          const blog = await timing.time("service", () =>
            service.getAdminBlogBySlug(slug),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminBlog(blog)),
          );
        },
      );
    },
    async handleUpdateBlog(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.blogs.update", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id, body } = await timing.time("parse", async () => ({
          ...adminBlogIdParamsSchema.parse(await params),
          body: adminBlogUpdateSchema.parse(await toJsonBody(request)),
        }));
        const blog = await timing.time("service", async () => {
          const updatedBlog = await service.updateBlog(id, body);
          revalidatePublicBlogContent();

          return updatedBlog;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminBlog(blog)),
        );
      });
    },
    async handleDeleteBlog(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.blogs.delete", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminBlogIdParamsSchema.parse(await params),
        );
        await timing.time("service", async () => {
          await service.deleteBlog(id);
          revalidatePublicBlogContent();
        });

        return timing.timeSync("response", () => createSuccessResponse(null));
      });
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
      return withApiTiming(request, "public.blogs.list", async (timing) => {
        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return publicBlogListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            category: url.searchParams.get("category") ?? undefined,
            tag: url.searchParams.get("tag") ?? undefined,
            featured: url.searchParams.get("featured") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const { result, statsByBlogId } = await timing.time(
          "service",
          async () => {
            const blogResult = await service.listPublicBlogs(query);
            const stats = await getBlogStats(
              statsService,
              blogResult.items.map((blog) => blog.id),
              getBlogStatsVisitorId(request),
            );

            return {
              result: blogResult,
              statsByBlogId: stats,
            };
          },
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
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
          ),
        );
      });
    },
    async handleGetBlog(request: Request, params: Promise<{ slug: string }>) {
      return withApiTiming(request, "public.blogs.get", async (timing) => {
        const { slug } = await timing.time("parse", async () =>
          publicBlogSlugParamsSchema.parse(await params),
        );
        const { blog, statsByBlogId } = await timing.time(
          "service",
          async () => {
            const loadedBlog = await service.getPublicBlogBySlug(slug);
            const stats = await getBlogStats(
              statsService,
              [loadedBlog.id],
              getBlogStatsVisitorId(request),
            );

            return {
              blog: loadedBlog,
              statsByBlogId: stats,
            };
          },
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            toPublicBlog(blog, resolveBlogStats(statsByBlogId, blog.id)),
          ),
        );
      });
    },
    async handleListSimilarBlogs(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      return withApiTiming(request, "public.blogs.similar", async (timing) => {
        const { slug, query } = await timing.time("parse", async () => {
          const parsedParams = publicBlogSlugParamsSchema.parse(await params);
          const url = new URL(request.url);

          return {
            ...parsedParams,
            query: publicSimilarBlogQuerySchema.parse({
              limit: url.searchParams.get("limit") ?? undefined,
            }),
          };
        });
        const { items, statsByBlogId } = await timing.time(
          "service",
          async () => {
            const similarItems = await service.getPublicSimilarBlogs(
              slug,
              query.limit,
            );
            const stats = await getBlogStats(
              statsService,
              similarItems.map((blog) => blog.id),
              getBlogStatsVisitorId(request),
            );

            return {
              items: similarItems,
              statsByBlogId: stats,
            };
          },
        );

        return timing.timeSync("response", () =>
          createSuccessResponse({
            items: items.map((blog) =>
              toPublicBlog(blog, resolveBlogStats(statsByBlogId, blog.id)),
            ),
          }),
        );
      });
    },
    async handleTrackBlogView(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      return withApiTiming(
        request,
        "public.blogs.track-view",
        async (timing) => {
          const { slug } = await timing.time("parse", async () =>
            publicBlogSlugParamsSchema.parse(await params),
          );
          const { result, visitor } = await timing.time("service", async () => {
            const blog = await service.getPublicBlogBySlug(slug);
            const ensuredVisitor = ensureBlogStatsVisitor(request);
            const trackResult = await statsService.trackView(
              blog.id,
              ensuredVisitor.visitorId,
            );

            return {
              result: trackResult,
              visitor: ensuredVisitor,
            };
          });

          return timing.timeSync("response", () =>
            applyBlogStatsVisitorCookie(createSuccessResponse(result), visitor),
          );
        },
      );
    },
    async handleToggleBlogLike(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      return withApiTiming(
        request,
        "public.blogs.toggle-like",
        async (timing) => {
          const { slug } = await timing.time("parse", async () =>
            publicBlogSlugParamsSchema.parse(await params),
          );
          const { result, visitor } = await timing.time("service", async () => {
            const blog = await service.getPublicBlogBySlug(slug);
            const ensuredVisitor = ensureBlogStatsVisitor(request);
            const likeResult = await statsService.toggleLike(
              blog.id,
              ensuredVisitor.visitorId,
            );

            return {
              result: likeResult,
              visitor: ensuredVisitor,
            };
          });

          return timing.timeSync("response", () =>
            applyBlogStatsVisitorCookie(createSuccessResponse(result), visitor),
          );
        },
      );
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
