import { successResponse } from "@/lib/api/response";
import type { CommentService } from "@/lib/comment/comment-service";
import type { CreateCommentInput, ListCommentsQuery, UpdateCommentInput } from "@/lib/comment/comment-dto";
import {
  commentIdSchema,
  createCommentBodySchema,
  listCommentsQuerySchema,
  updateCommentBodySchema,
} from "@/lib/comment/comment-dto";

type CommentHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: CommentService;
};

type CommentRouteParams = {
  id: string;
};

type ListCommentsResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CommentHandler = {
  createComment: (request: Request) => Promise<Response>;
  deleteComment: (request: Request, params: CommentRouteParams) => Promise<Response>;
  getComment: (request: Request, params: CommentRouteParams) => Promise<Response>;
  listComments: (request: Request) => Promise<Response>;
  updateComment: (request: Request, params: CommentRouteParams) => Promise<Response>;
};

export function createCommentHandler(dependencies: CommentHandlerDependencies): CommentHandler {
  return {
    async createComment(request) {
      await dependencies.requireSession(request);

      const input = createCommentBodySchema.parse(await parseJsonBody<CreateCommentInput>(request));
      const comment = await dependencies.service.createComment(input);

      return successResponse(comment, {
        message: "Comment created successfully.",
        status: 201,
      });
    },
    async deleteComment(request, params) {
      await dependencies.requireSession(request);

      const id = commentIdSchema.parse(params.id);
      const deletedComment = await dependencies.service.deleteComment(id);

      return successResponse(deletedComment, {
        message: "Comment deleted successfully.",
      });
    },
    async getComment(request, params) {
      await dependencies.requireSession(request);

      const id = commentIdSchema.parse(params.id);
      const comment = await dependencies.service.getCommentById(id);

      return successResponse(comment, {
        message: "Comment fetched successfully.",
      });
    },
    async listComments(request) {
      await dependencies.requireSession(request);

      const query = parseListCommentsQuery(request);
      const result = await dependencies.service.listComments(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Comments fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListCommentsResponseMeta,
        },
      );
    },
    async updateComment(request, params) {
      await dependencies.requireSession(request);

      const id = commentIdSchema.parse(params.id);
      const input = updateCommentBodySchema.parse(await parseJsonBody<UpdateCommentInput>(request));
      const comment = await dependencies.service.updateComment(id, input);

      return successResponse(comment, {
        message: "Comment updated successfully.",
      });
    },
  };
}

function parseListCommentsQuery(request: Request): ListCommentsQuery {
  const { searchParams } = new URL(request.url);

  return listCommentsQuerySchema.parse({
    articleId: searchParams.get("articleId") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
