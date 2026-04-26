import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  adminCommentIdParamsSchema,
  adminCommentListQuerySchema,
  adminCommentReplySchema,
  adminCommentUpdateSchema,
  publicCommentCreateSchema,
  publicCommentListQuerySchema,
} from "./dto";
import {
  applyCommentGuardCookie,
  commentGuard,
  type CommentGuard,
} from "./guard";
import {
  toAdminComment,
  toPublicCommentTree,
  toPublicCommentCreateResult,
} from "./mappers";
import {
  createCommentService,
  type CommentService,
  type CommentServiceDeps,
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

type CommentHandlerDeps = {
  service?: CommentService;
  serviceDeps?: CommentServiceDeps;
  guard?: CommentGuard;
};

export function createPublicCommentHandlers({
  serviceDeps,
  service = createCommentService(serviceDeps),
  guard = commentGuard,
}: CommentHandlerDeps = {}) {
  return {
    async handleListComments(request: Request) {
      try {
        const url = new URL(request.url);
        const query = publicCommentListQuerySchema.parse({
          postSlug: url.searchParams.get("postSlug") ?? undefined,
        });
        const items = await service.listPublicComments(query);

        return createSuccessResponse({
          items: toPublicCommentTree(items),
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleCreateComment(request: Request) {
      try {
        const body = publicCommentCreateSchema.parse(await toJsonBody(request));
        const guardResult = await guard.validateCreateRequest(request, body);
        const comment = await service.createPublicComment(body);

        return applyCommentGuardCookie(
          createSuccessResponse(
            toPublicCommentCreateResult(comment),
            undefined,
            201,
          ),
          guardResult,
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createAdminCommentHandlers({
  serviceDeps,
  service = createCommentService(serviceDeps),
}: CommentHandlerDeps = {}) {
  return {
    async handleListComments(request: Request) {
      try {
        await requireRequestSession(request);

        const url = new URL(request.url);
        const query = adminCommentListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          status: url.searchParams.get("status") ?? undefined,
          postSlug: url.searchParams.get("postSlug") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminComments(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminComment),
            stats: result.stats,
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
    async handleCreateComment(request: Request) {
      try {
        const session = await requireAdminRequestSession(request);

        const body = adminCommentReplySchema.parse(await toJsonBody(request));
        const comment = await service.createAdminCommentReply(body, {
          email: session.user.email,
          image: session.user.image,
          name: session.user.name,
        });

        return createSuccessResponse(toAdminComment(comment), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateComment(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminCommentIdParamsSchema.parse(await params);
        const body = adminCommentUpdateSchema.parse(await toJsonBody(request));
        const comment = await service.updateComment(id, body);

        return createSuccessResponse(toAdminComment(comment));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteComment(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminCommentIdParamsSchema.parse(await params);
        await service.deleteComment(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultPublicHandlers = createPublicCommentHandlers();
const defaultAdminHandlers = createAdminCommentHandlers();

export const handlePublicListComments =
  defaultPublicHandlers.handleListComments;
export const handlePublicCreateComment =
  defaultPublicHandlers.handleCreateComment;

export const handleAdminListComments = defaultAdminHandlers.handleListComments;
export const handleAdminCreateComment =
  defaultAdminHandlers.handleCreateComment;
export const handleAdminUpdateComment =
  defaultAdminHandlers.handleUpdateComment;
export const handleAdminDeleteComment =
  defaultAdminHandlers.handleDeleteComment;
