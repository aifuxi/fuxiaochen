import {
  handleAdminDeleteComment,
  handleAdminUpdateComment,
} from "@/lib/server/comments/handler";

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateComment(request, context.params);
}

export function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleAdminDeleteComment(request, context.params);
}
