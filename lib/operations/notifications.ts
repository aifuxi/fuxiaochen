import "server-only";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { AdminBusinessError, authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction } from "@/lib/database";
import { notification, notificationRead } from "@/lib/database/schema";

import { notificationQuerySchema, type NotificationPage } from "./schema";

export type OperationTransaction = Parameters<Parameters<typeof writeTransaction>[0]>[0];
export function syncNotifications(tx: OperationTransaction) {
  const now = Date.now();
  tx.run(sql`INSERT INTO notification (id, kind, "sourceId", title, href, "createdAt", "resolvedAt")
    SELECT 'friend:' || f.id || ':' || f.version, 'friend', f.id, f.name || ' 的友链待审核', '/admin/friends-links', f."updatedAt", NULL FROM friend_link f WHERE f.status = 'pending'
    ON CONFLICT (id) DO NOTHING`);
  tx.run(sql`UPDATE notification SET "resolvedAt" = ${now} WHERE "resolvedAt" IS NULL AND
    (kind = 'friend' AND NOT EXISTS (SELECT 1 FROM friend_link f WHERE f.status = 'pending' AND notification.id = 'friend:' || f.id || ':' || f.version))`);
}
export function notificationCount(tx: OperationTransaction, adminId: number) {
  return tx.get<{ count: number }>(
    sql`SELECT count(*) AS count FROM notification n WHERE n."resolvedAt" IS NULL AND NOT EXISTS (SELECT 1 FROM notification_read r WHERE r."notificationId" = n.id AND r."adminId" = ${adminId})`,
  ).count;
}
export async function getNotifications(
  query: z.infer<typeof notificationQuerySchema>,
  actor: TaxonomyActor,
): Promise<NotificationPage> {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    syncNotifications(tx);
    const unreadCount = notificationCount(tx, actor.adminId);
    const unread = query.unread === "true";
    const filter = sql`FROM notification n LEFT JOIN notification_read r ON r."notificationId" = n.id AND r."adminId" = ${actor.adminId} WHERE (${Number(unread)} = 0 OR (r."readAt" IS NULL AND n."resolvedAt" IS NULL))`;
    const { total } = tx.get<{ total: number }>(sql`SELECT count(*) AS total ${filter}`);
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = tx.all<{
      id: string;
      title: string;
      href: string;
      createdAt: number;
      isRead: number;
      resolved: number;
    }>(
      sql`SELECT n.id, n.title, CASE WHEN n.kind = 'friend' THEN '/admin/friends-links?record=' || n."sourceId" ELSE n.href END AS href, n."createdAt", (r."readAt" IS NOT NULL) AS "isRead", (n."resolvedAt" IS NOT NULL) AS resolved ${filter} ORDER BY n."createdAt" DESC, n.id DESC LIMIT ${query.pageSize} OFFSET ${(page - 1) * query.pageSize}`,
    );
    return {
      items: rows.map(({ isRead, resolved, ...row }) => ({
        ...row,
        createdAt: new Date(row.createdAt).toISOString(),
        read: Boolean(isRead),
        resolved: Boolean(resolved),
      })),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      unreadCount,
    };
  });
}
export async function readNotifications(ids: string[], actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    for (const id of new Set(ids)) {
      if (
        !tx.select({ id: notification.id }).from(notification).where(eq(notification.id, id)).get()
      )
        throw new AdminBusinessError("NOT_FOUND", "通知不存在，请重新载入。");
      tx.insert(notificationRead)
        .values({ notificationId: id, adminId: actor.adminId, readAt: new Date() })
        .onConflictDoNothing()
        .run();
    }
    return { unreadCount: notificationCount(tx, actor.adminId) };
  });
}
