import { handleAdminListNotifications } from "@/lib/server/notifications/handler";

export function GET(request: Request) {
  return handleAdminListNotifications(request);
}
