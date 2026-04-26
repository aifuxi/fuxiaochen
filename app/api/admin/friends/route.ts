import {
  handleAdminCreateFriend,
  handleAdminListFriends,
} from "@/lib/server/friends/handler";

export function GET(request: Request) {
  return handleAdminListFriends(request);
}

export function POST(request: Request) {
  return handleAdminCreateFriend(request);
}
