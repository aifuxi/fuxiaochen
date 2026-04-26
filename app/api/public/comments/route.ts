import {
  handlePublicCreateComment,
  handlePublicListComments,
} from "@/lib/server/comments/handler";

export function GET(request: Request) {
  return handlePublicListComments(request);
}

export function POST(request: Request) {
  return handlePublicCreateComment(request);
}
