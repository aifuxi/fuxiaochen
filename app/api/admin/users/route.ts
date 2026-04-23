import { handleAdminListUsers } from "@/lib/server/users/handler";

export function GET(request: Request) {
  return handleAdminListUsers(request);
}
