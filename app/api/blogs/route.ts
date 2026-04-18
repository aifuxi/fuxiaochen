import { handleCreateBlog, handleListBlogs } from "@/lib/server/blogs/handler";

export function GET(request: Request) {
  return handleListBlogs(request);
}

export function POST(request: Request) {
  return handleCreateBlog(request);
}
