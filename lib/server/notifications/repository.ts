import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  notifications,
  type NewNotification,
  type Notification,
} from "@/lib/db/schema";
import type { AdminNotificationListQuery } from "@/lib/server/notifications/dto";
import type { NotificationRepository } from "@/lib/server/notifications/service";

const getNotificationWhere = ({
  status,
}: Pick<AdminNotificationListQuery, "status">) =>
  status === "unread" ? isNull(notifications.readAt) : undefined;

export const notificationRepository: NotificationRepository = {
  async list(query) {
    const where = getNotificationWhere(query);
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(where)
        .orderBy(
          desc(isNull(notifications.readAt)),
          desc(notifications.createdAt),
          desc(notifications.id),
        )
        .limit(query.pageSize)
        .offset(offset),
      db.select({ total: count() }).from(notifications).where(where),
    ]);

    return {
      items,
      total: totalRows[0]?.total ?? 0,
    };
  },
  async countUnread() {
    const [result] = await db
      .select({ total: count() })
      .from(notifications)
      .where(isNull(notifications.readAt));

    return result?.total ?? 0;
  },
  async create(notification: NewNotification) {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();

    if (!created) {
      throw new Error("Notification insert did not return a row");
    }

    return created;
  },
  async updateReadState(id, readAt, updatedAt) {
    const [updated] = await db
      .update(notifications)
      .set({
        readAt,
        updatedAt,
      })
      .where(eq(notifications.id, id))
      .returning();

    return updated ?? null;
  },
  async markAllRead(readAt) {
    const updated = await db
      .update(notifications)
      .set({
        readAt,
        updatedAt: readAt,
      })
      .where(and(isNull(notifications.readAt)))
      .returning({ id: notifications.id });

    return updated.length;
  },
};

export type { NewNotification, Notification };
