import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createCommentHandler } from "@/lib/comment/comment-handler";
import { createCommentRepository } from "@/lib/comment/comment-repository";
import { createCommentService } from "@/lib/comment/comment-service";

const commentHandler = createCommentHandler({
  requireSession: requireApiSession,
  service: createCommentService(createCommentRepository()),
});

export const GET = handleRoute(async (request: Request) => commentHandler.listComments(request));

export const POST = handleRoute(async (request: Request) => commentHandler.createComment(request));
