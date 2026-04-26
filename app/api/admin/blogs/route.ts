import {
  handleAdminCreateBlog,
  handleAdminListBlogs,
} from "@/lib/server/blogs/handler";

export function GET(request: Request) {
  return handleAdminListBlogs(request);
}

export function POST(request: Request) {
  return handleAdminCreateBlog(request);
}
