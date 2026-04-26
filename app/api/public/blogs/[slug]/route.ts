import { handlePublicGetBlog } from "@/lib/server/blogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handlePublicGetBlog(request, params);
}
