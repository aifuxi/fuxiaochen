import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  adminBlogCreateSchema,
  adminBlogIdParamsSchema,
  adminBlogListQuerySchema,
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
};

export function createAdminBlogHandlers({
  serviceDeps,
  service = createBlogService(serviceDeps),
}: BlogHandlerDeps = {}) {
  return {
    async handleListBlogs(request: Request) {
      try {
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
        const result = await service.listAdminBlogs(query);

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
        const body = adminBlogCreateSchema.parse(await toJsonBody(request));
        const blog = await service.createBlog(body);

        return createSuccessResponse(toAdminBlog(blog), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetBlog(_request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = adminBlogIdParamsSchema.parse(await params);
        const blog = await service.getAdminBlog(id);

        return createSuccessResponse(toAdminBlog(blog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateBlog(request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = adminBlogIdParamsSchema.parse(await params);
        const body = adminBlogUpdateSchema.parse(await toJsonBody(request));
        const blog = await service.updateBlog(id, body);

        return createSuccessResponse(toAdminBlog(blog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteBlog(_request: Request, params: Promise<{ id: string }>) {
      try {
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

        return createSuccessResponse(
          {
            items: result.items.map(toPublicBlog),
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
    async handleGetBlog(_request: Request, params: Promise<{ slug: string }>) {
      try {
        const { slug } = publicBlogSlugParamsSchema.parse(await params);
        const blog = await service.getPublicBlogBySlug(slug);

        return createSuccessResponse(toPublicBlog(blog));
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

        return createSuccessResponse({
          items: items.map(toPublicBlog),
        });
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
export const handleAdminUpdateBlog = defaultAdminHandlers.handleUpdateBlog;
export const handleAdminDeleteBlog = defaultAdminHandlers.handleDeleteBlog;

export const handlePublicListBlogs = defaultPublicHandlers.handleListBlogs;
export const handlePublicGetBlog = defaultPublicHandlers.handleGetBlog;
export const handlePublicListSimilarBlogs =
  defaultPublicHandlers.handleListSimilarBlogs;
