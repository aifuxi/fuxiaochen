-- 取消全部排期并保留文章元数据，避免功能退役时自动对外发布。
UPDATE `post` SET `status` = 'draft' WHERE `status` = 'scheduled';--> statement-breakpoint
-- 发布成功通知也来自旧排期任务；显式先删已读关联，兼容迁移器关闭外键。
DELETE FROM `notification_read` WHERE `notificationId` IN (SELECT `id` FROM `notification` WHERE `kind` IN ('schedule-error', 'published'));--> statement-breakpoint
DELETE FROM `notification` WHERE `kind` IN ('schedule-error', 'published');--> statement-breakpoint
DROP INDEX `post_status_scheduledFor_idx`;--> statement-breakpoint
ALTER TABLE `post` DROP COLUMN `scheduledFor`;