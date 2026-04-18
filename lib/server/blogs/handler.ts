import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  blogCreateSchema,
  blogIdParamsSchema,
  blogListQuerySchema,
  blogUpdateSchema,
} from "./dto";
import { blogRepository } from "./repository";
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

export function createBlogHandlers({
  serviceDeps,
  service = createBlogService({
    repository: blogRepository,
    ...serviceDeps,
  }),
}: BlogHandlerDeps = {}) {
  return {
    async handleListBlogs(request: Request) {
      try {
        const url = new URL(request.url);
        const query = blogListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          published: url.searchParams.get("published") ?? undefined,
          featured: url.searchParams.get("featured") ?? undefined,
          categoryId: url.searchParams.get("categoryId") ?? undefined,
        });
        const result = await service.listBlogs(query);

        return createSuccessResponse(
          {
            items: result.items,
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
        const body = blogCreateSchema.parse(await toJsonBody(request));
        const blog = await service.createBlog(body);

        return createSuccessResponse(blog, undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetBlog(_request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = blogIdParamsSchema.parse(await params);
        const blog = await service.getBlog(id);

        return createSuccessResponse(blog);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateBlog(request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = blogIdParamsSchema.parse(await params);
        const body = blogUpdateSchema.parse(await toJsonBody(request));
        const blog = await service.updateBlog(id, body);

        return createSuccessResponse(blog);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteBlog(_request: Request, params: Promise<{ id: string }>) {
      try {
        const { id } = blogIdParamsSchema.parse(await params);
        await service.deleteBlog(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultHandlers = createBlogHandlers();

export const handleListBlogs = defaultHandlers.handleListBlogs;
export const handleCreateBlog = defaultHandlers.handleCreateBlog;
export const handleGetBlog = defaultHandlers.handleGetBlog;
export const handleUpdateBlog = defaultHandlers.handleUpdateBlog;
export const handleDeleteBlog = defaultHandlers.handleDeleteBlog;
