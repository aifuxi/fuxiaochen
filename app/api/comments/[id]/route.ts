import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createCommentHandler } from "@/lib/comment/comment-handler";
import { createCommentRepository } from "@/lib/comment/comment-repository";
import { createCommentService } from "@/lib/comment/comment-service";

const commentHandler = createCommentHandler({
  requireSession: requireApiSession,
  service: createCommentService(createCommentRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  commentHandler.getComment(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  commentHandler.updateComment(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  commentHandler.deleteComment(request, await context.params),
);
