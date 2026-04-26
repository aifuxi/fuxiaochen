import { handlePublicListFriends } from "@/lib/server/friends/handler";

export function GET() {
  return handlePublicListFriends();
}
