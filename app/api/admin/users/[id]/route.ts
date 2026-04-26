import {
  handleAdminGetUser,
  handleAdminUpdateUserRole,
} from "@/lib/server/users/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminGetUser(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateUserRole(request, params);
}
