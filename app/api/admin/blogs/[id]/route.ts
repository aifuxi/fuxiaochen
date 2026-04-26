import {
  handleAdminDeleteBlog,
  handleAdminGetBlog,
  handleAdminUpdateBlog,
} from "@/lib/server/blogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminGetBlog(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateBlog(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminDeleteBlog(request, params);
}
