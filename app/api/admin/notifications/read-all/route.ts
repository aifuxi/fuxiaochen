import { handleAdminMarkAllNotificationsRead } from "@/lib/server/notifications/handler";

export function POST(request: Request) {
  return handleAdminMarkAllNotificationsRead(request);
}
