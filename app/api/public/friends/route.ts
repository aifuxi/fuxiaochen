import { handlePublicListFriends } from "@/lib/server/friends/handler";

export function GET(request: Request) {
  return handlePublicListFriends(request);
}
