import { handlePublicToggleBlogLike } from "@/lib/server/blogs/handler";

export function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handlePublicToggleBlogLike(request, params);
}
