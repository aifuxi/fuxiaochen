-- 移除评论通知及已读关联；迁移器关闭外键时也显式清理子记录。
DELETE FROM notification_read WHERE notificationId IN (SELECT id FROM notification WHERE kind = 'comment');--> statement-breakpoint
DELETE FROM notification WHERE kind = 'comment';--> statement-breakpoint
DROP TABLE `analytics_rate_limit`;--> statement-breakpoint
DROP TABLE `comment`;--> statement-breakpoint
DROP TABLE `comment_rate_limit`;--> statement-breakpoint
DROP TABLE `page_visit`;--> statement-breakpoint
DROP TABLE `visit_session`;--> statement-breakpoint
ALTER TABLE `site_setting` DROP COLUMN `enableComments`;--> statement-breakpoint
ALTER TABLE `site_setting` DROP COLUMN `localAnalyticsEnabled`;--> statement-breakpoint
ALTER TABLE `site_setting` DROP COLUMN `localAnalyticsStartedAt`;
