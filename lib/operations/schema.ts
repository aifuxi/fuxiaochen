import { z } from "zod";

import { listQuerySchema, versionSchema, type Page } from "@/lib/admin/schema";

export const searchKinds = [
  "post",
  "category",
  "tag",
  "comment",
  "media",
  "friend",
  "release",
] as const;
export const searchLabels: Record<(typeof searchKinds)[number], string> = {
  post: "文章",
  category: "分类",
  tag: "标签",
  comment: "评论",
  media: "媒体",
  friend: "友链",
  release: "更新日志",
};
export const searchSchema = listQuerySchema.extend({ kind: z.enum(searchKinds).optional() });
export type SearchQuery = z.infer<typeof searchSchema>;
export type SearchItem = {
  id: string;
  kind: (typeof searchKinds)[number];
  title: string;
  description: string;
  href: string;
};
export type SearchPage = Page<SearchItem>;
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
