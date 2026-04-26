import {
  handleAdminCreateComment,
  handleAdminListComments,
} from "@/lib/server/comments/handler";

export function GET(request: Request) {
  return handleAdminListComments(request);
}

export function POST(request: Request) {
  return handleAdminCreateComment(request);
}
