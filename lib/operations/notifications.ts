import "server-only";
import { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { AdminBusinessError, authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import { notificationQuerySchema, type NotificationPage } from "./schema";

export type OperationTransaction = Parameters<
  Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]
>[0];
export async function syncNotifications(tx: OperationTransaction) {
  const raw = getDatabase().raw;
  const now = new Date().toISOString();
  await tx.query(
    raw.sql`INSERT INTO notification (id, kind, sourceId, title, href, createdAt, resolvedAt)
    SELECT 'comment:' || c.id || ':' || c.version, 'comment', c.id, c.author || ' 的评论待审核', '/admin/comments', c.updatedAt, NULL FROM comment c WHERE c.status = 'pending'
    ON CONFLICT (id) DO NOTHING RETURNING id`
      .returnsRow({ id: "sqlite/text@1" })
      .build(),
  );
  await tx.query(
    raw.sql`INSERT INTO notification (id, kind, sourceId, title, href, createdAt, resolvedAt)
    SELECT 'friend:' || f.id || ':' || f.version, 'friend', f.id, f.name || ' 的友链待审核', '/admin/friends-links', f.updatedAt, NULL FROM friend_link f WHERE f.status = 'pending'
    ON CONFLICT (id) DO NOTHING RETURNING id`
      .returnsRow({ id: "sqlite/text@1" })
      .build(),
  );
  await tx.query(
    raw.sql`UPDATE notification SET resolvedAt = ${now} WHERE resolvedAt IS NULL AND
    ((kind = 'comment' AND NOT EXISTS (SELECT 1 FROM comment c WHERE c.status = 'pending' AND notification.id = 'comment:' || c.id || ':' || c.version)) OR
     (kind = 'friend' AND NOT EXISTS (SELECT 1 FROM friend_link f WHERE f.status = 'pending' AND notification.id = 'friend:' || f.id || ':' || f.version)) OR
     (kind = 'schedule-error' AND NOT EXISTS (SELECT 1 FROM post p WHERE p.status = 'scheduled' AND notification.id = 'schedule-error:' || p.id || ':' || p.version))) RETURNING id`
      .returnsRow({ id: "sqlite/text@1" })
      .build(),
  );
}
export async function notificationCount(tx: OperationTransaction, adminId: number) {
  const [row] = await tx.query(
    getDatabase().raw
      .sql`SELECT count(*) AS count FROM notification n WHERE n.resolvedAt IS NULL AND NOT EXISTS (SELECT 1 FROM notification_read r WHERE r.notificationId = n.id AND r.adminId = ${adminId})`
      .returnsRow({ count: "sqlite/integer@1" })
      .build(),
  );
  return row.count;
}
export async function getNotifications(
  query: z.infer<typeof notificationQuerySchema>,
  actor: TaxonomyActor,
): Promise<NotificationPage> {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    await syncNotifications(tx);
    const raw = getDatabase().raw;
    const unreadCount = await notificationCount(tx, actor.adminId);
    const unread = query.unread === "true";
    const filter =
      raw.sql`FROM notification n LEFT JOIN notification_read r ON r.notificationId = n.id AND r.adminId = ${actor.adminId} WHERE (${unread ? 1 : 0} = 0 OR (r.readAt IS NULL AND n.resolvedAt IS NULL))`.returnsRow(
        { id: "sqlite/text@1" },
      );
    const [count] = await tx.query(
      raw.sql`SELECT count(*) AS total ${filter}`.returnsRow({ total: "sqlite/integer@1" }).build(),
    );
    const pageCount = Math.max(1, Math.ceil(count.total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = await tx.query(
      raw.sql`SELECT n.id, n.title, n.href, n.createdAt, (r.readAt IS NOT NULL) AS isRead, (n.resolvedAt IS NOT NULL) AS resolved ${filter} ORDER BY n.createdAt DESC, n.id DESC LIMIT ${query.pageSize} OFFSET ${(page - 1) * query.pageSize}`
        .returnsRow({
          id: "sqlite/text@1",
          title: "sqlite/text@1",
          href: "sqlite/text@1",
          createdAt: "sqlite/text@1",
          isRead: "sqlite/integer@1",
          resolved: "sqlite/integer@1",
        })
        .build(),
    );
    return {
      items: rows.map(({ isRead, resolved, ...row }) => ({
        ...row,
        read: Boolean(isRead),
        resolved: Boolean(resolved),
      })),
      total: count.total,
      page,
      pageSize: query.pageSize,
      pageCount,
      unreadCount,
    };
  });
}
export async function readNotifications(ids: string[], actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    for (const id of new Set(ids)) {
      if (!(await tx.orm.Notification.where({ id }).first()))
        throw new AdminBusinessError("NOT_FOUND", "通知不存在，请重新载入。");
      if (
        !(await tx.orm.NotificationRead.where({
          notificationId: id,
          adminId: actor.adminId,
        }).first())
      )
        await tx.orm.NotificationRead.create({
          notificationId: id,
          adminId: actor.adminId,
          readAt: new Date(),
        });
    }
    return { unreadCount: await notificationCount(tx, actor.adminId) };
  });
}
