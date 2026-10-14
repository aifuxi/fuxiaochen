import { z } from "zod";

import { listQuerySchema, versionSchema, type Page } from "@/lib/admin/schema";

export const notificationQuerySchema = listQuerySchema
  .omit({ q: true })
  .extend({ unread: z.enum(["true", "false"]).optional() });
export const readNotificationsSchema = z.strictObject({
  ids: z.array(z.string().min(1).max(160)).min(1).max(50),
});
export type NotificationItem = {
  id: string;
  title: string;
  href: string;
  createdAt: string;
  read: boolean;
  resolved: boolean;
};
export type NotificationPage = Page<NotificationItem> & { unreadCount: number };
export const operationSettingsSchema = z.strictObject({
  autoBackup: z.boolean(),
  version: versionSchema,
});
export type OperationSettings = {
  autoBackup: boolean;
  version: number;
  schedulerLastRunAt: string | null;
};
export const backupRequestSchema = z.strictObject({ id: z.uuid() });
export type BackupItem = {
  id: string;
  status: "running" | "complete" | "failed";
  bytes: number | null;
  sha256: string | null;
  createdAt: string;
  finishedAt: string | null;
};
export type BackupPage = Page<BackupItem>;
