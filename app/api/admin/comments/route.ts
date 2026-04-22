import { handleAdminListComments } from "@/lib/server/comments/handler";

export function GET(request: Request) {
  return handleAdminListComments(request);
}
