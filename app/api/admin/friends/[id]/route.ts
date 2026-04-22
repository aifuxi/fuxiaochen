import {
  handleAdminDeleteFriend,
  handleAdminGetFriend,
  handleAdminUpdateFriend,
} from "@/lib/server/friends/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminGetFriend(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateFriend(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminDeleteFriend(request, params);
}
