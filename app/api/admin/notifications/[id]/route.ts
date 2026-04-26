import { handleAdminUpdateNotification } from "@/lib/server/notifications/handler";

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateNotification(request, context.params);
}
