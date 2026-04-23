import { handleAdminRevokeUserSessions } from "@/lib/server/users/handler";

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminRevokeUserSessions(request, params);
}
