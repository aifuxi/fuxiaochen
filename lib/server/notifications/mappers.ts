import type { Notification } from "@/lib/db/schema";

import type { NotificationListResult } from "./service";

export type AdminNotification = {
  id: string;
  type: Notification["type"];
  action: Notification["action"];
  title: string;
  description: string;
  href: string;
  entityType: Notification["entityType"];
  entityId: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminNotificationListPayload = {
  items: AdminNotification[];
  unreadCount: number;
};

export function toAdminNotification(
  notification: Notification,
): AdminNotification {
  return {
    id: notification.id,
    type: notification.type,
    action: notification.action,
    title: notification.title,
    description: notification.description,
    href: notification.href,
    entityType: notification.entityType,
    entityId: notification.entityId,
    actorUserId: notification.actorUserId,
    metadata: notification.metadata,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  };
}

export function toAdminNotificationListPayload({
  items,
  unreadCount,
}: NotificationListResult): AdminNotificationListPayload {
  return {
    items: items.map(toAdminNotification),
    unreadCount,
  };
}
