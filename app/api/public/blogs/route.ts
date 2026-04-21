import { handlePublicListBlogs } from "@/lib/server/blogs/handler";

export function GET(request: Request) {
  return handlePublicListBlogs(request);
}
