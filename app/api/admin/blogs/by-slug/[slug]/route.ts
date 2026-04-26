import { handleAdminGetBlogBySlug } from "@/lib/server/blogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleAdminGetBlogBySlug(request, params);
}
