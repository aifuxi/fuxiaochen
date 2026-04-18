import {
  handleDeleteBlog,
  handleGetBlog,
  handleUpdateBlog,
} from "@/lib/server/blogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetBlog(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdateBlog(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleDeleteBlog(request, params);
}
