import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
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
      return withApiTiming(request, "public.comments.list", async (timing) => {
        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return publicCommentListQuerySchema.parse({
            postSlug: url.searchParams.get("postSlug") ?? undefined,
          });
        });
        const items = await timing.time("service", () =>
          service.listPublicComments(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse({
            items: toPublicCommentTree(items),
          }),
        );
      });
    },
    async handleCreateComment(request: Request) {
      return withApiTiming(
        request,
        "public.comments.create",
        async (timing) => {
          const body = await timing.time("parse", async () =>
            publicCommentCreateSchema.parse(await toJsonBody(request)),
          );
          const { comment, guardResult } = await timing.time(
            "service",
            async () => {
              const validatedGuard = await guard.validateCreateRequest(
                request,
                body,
              );
              const createdComment = await service.createPublicComment(body);

              return {
                comment: createdComment,
                guardResult: validatedGuard,
              };
            },
          );

          return timing.timeSync("response", () =>
            applyCommentGuardCookie(
              createSuccessResponse(
                toPublicCommentCreateResult(comment),
                undefined,
                201,
              ),
              guardResult,
            ),
          );
        },
      );
    },
  };
}

export function createAdminCommentHandlers({
  serviceDeps,
  service = createCommentService(serviceDeps),
}: CommentHandlerDeps = {}) {
  return {
    async handleListComments(request: Request) {
      return withApiTiming(request, "admin.comments.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminCommentListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            status: url.searchParams.get("status") ?? undefined,
            postSlug: url.searchParams.get("postSlug") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listAdminComments(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminComment),
              stats: result.stats,
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
    async handleCreateComment(request: Request) {
      return withApiTiming(request, "admin.comments.create", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminCommentReplySchema.parse(await toJsonBody(request)),
        );
        const comment = await timing.time("service", () =>
          service.createAdminCommentReply(body, {
            email: session.user.email,
            image: session.user.image,
            name: session.user.name,
          }),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminComment(comment), undefined, 201),
        );
      });
    },
    async handleUpdateComment(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.comments.update", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id, body } = await timing.time("parse", async () => ({
          ...adminCommentIdParamsSchema.parse(await params),
          body: adminCommentUpdateSchema.parse(await toJsonBody(request)),
        }));
        const comment = await timing.time("service", () =>
          service.updateComment(id, body),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminComment(comment)),
        );
      });
    },
    async handleDeleteComment(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.comments.delete", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminCommentIdParamsSchema.parse(await params),
        );
        await timing.time("service", () => service.deleteComment(id));

        return timing.timeSync("response", () => createSuccessResponse(null));
      });
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
