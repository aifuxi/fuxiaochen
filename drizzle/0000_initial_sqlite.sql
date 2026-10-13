CREATE TABLE `admin` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`passwordHash` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_username_unique` ON `admin` (`username`);--> statement-breakpoint
CREATE TABLE `analytics_rate_limit` (
	`id` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_rate_limit_expiresAt_idx` ON `analytics_rate_limit` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `backup_run` (
	`id` text PRIMARY KEY NOT NULL,
	`dailyKey` text,
	`status` text NOT NULL,
	`bytes` integer,
	`sha256` text,
	`createdAt` integer NOT NULL,
	`finishedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `backup_run_dailyKey_unique` ON `backup_run` (`dailyKey`);--> statement-breakpoint
CREATE INDEX `backup_run_createdAt_id_idx` ON `backup_run` (`createdAt`,`id`);--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nameKey` text NOT NULL,
	`color` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_nameKey_unique` ON `category` (`nameKey`);--> statement-breakpoint
CREATE TABLE `comment` (
	`id` text PRIMARY KEY NOT NULL,
	`postId` text NOT NULL,
	`parentId` text,
	`adminId` integer,
	`author` text NOT NULL,
	`authorKind` text NOT NULL,
	`submissionId` text,
	`submissionHash` text,
	`email` text,
	`content` text NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`version` integer NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parentId`,`postId`) REFERENCES `comment`(`id`,`postId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comment_submissionId_unique` ON `comment` (`submissionId`);--> statement-breakpoint
CREATE INDEX `comment_createdAt_id_idx` ON `comment` (`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `comment_status_createdAt_id_idx` ON `comment` (`status`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `comment_postId_idx` ON `comment` (`postId`);--> statement-breakpoint
CREATE INDEX `comment_parentId_idx` ON `comment` (`parentId`);--> statement-breakpoint
CREATE UNIQUE INDEX `comment_id_postId_unique` ON `comment` (`id`,`postId`);--> statement-breakpoint
CREATE TABLE `comment_rate_limit` (
	`id` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comment_rate_limit_expiresAt_idx` ON `comment_rate_limit` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `friend_link` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`avatar` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`enabled` integer NOT NULL,
	`version` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `friend_link_createdAt_id_idx` ON `friend_link` (`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `friend_link_status_enabled_idx` ON `friend_link` (`status`,`enabled`);--> statement-breakpoint
CREATE TABLE `login_rate_limit` (
	`id` integer PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`adminId` integer NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`expectedBytes` integer NOT NULL,
	`sha256` text NOT NULL,
	`stagingKey` text NOT NULL,
	`stagingCleanedAt` integer,
	`objectKey` text NOT NULL,
	`bytes` integer,
	`mime` text,
	`width` integer,
	`height` integer,
	`status` text NOT NULL,
	`leaseToken` text,
	`leaseUntil` integer,
	`createdAt` integer NOT NULL,
	`uploadedAt` integer,
	`expiresAt` integer NOT NULL,
	`deletedAt` integer,
	FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_stagingKey_unique` ON `media` (`stagingKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `media_objectKey_unique` ON `media` (`objectKey`);--> statement-breakpoint
CREATE INDEX `media_status_expiresAt_idx` ON `media` (`status`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `media_createdAt_id_idx` ON `media` (`createdAt`,`id`);--> statement-breakpoint
CREATE TABLE `media_upload_limit` (
	`adminId` integer PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL,
	FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`sourceId` text,
	`title` text NOT NULL,
	`href` text NOT NULL,
	`createdAt` integer NOT NULL,
	`resolvedAt` integer
);
--> statement-breakpoint
CREATE INDEX `notification_createdAt_id_idx` ON `notification` (`createdAt`,`id`);--> statement-breakpoint
CREATE TABLE `notification_read` (
	`notificationId` text NOT NULL,
	`adminId` integer NOT NULL,
	`readAt` integer NOT NULL,
	PRIMARY KEY(`notificationId`, `adminId`),
	FOREIGN KEY (`notificationId`) REFERENCES `notification`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `operation_setting` (
	`id` integer PRIMARY KEY NOT NULL,
	`autoBackup` integer NOT NULL,
	`version` integer NOT NULL,
	`schedulerLastRunAt` integer,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `page_visit` (
	`id` text PRIMARY KEY NOT NULL,
	`visitorHash` text NOT NULL,
	`sessionId` text NOT NULL,
	`path` text NOT NULL,
	`postId` text,
	`article` integer NOT NULL,
	`source` text NOT NULL,
	`referrerHost` text NOT NULL,
	`device` text NOT NULL,
	`browser` text NOT NULL,
	`os` text NOT NULL,
	`ip` text NOT NULL,
	`location` text NOT NULL,
	`createdAt` integer NOT NULL,
	`lastSeenAt` integer NOT NULL,
	`durationMs` integer NOT NULL,
	`progress` integer NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `visit_session`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `page_visit_createdAt_id_idx` ON `page_visit` (`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `page_visit_visitorHash_lastSeenAt_idx` ON `page_visit` (`visitorHash`,`lastSeenAt`);--> statement-breakpoint
CREATE INDEX `page_visit_sessionId_idx` ON `page_visit` (`sessionId`);--> statement-breakpoint
CREATE INDEX `page_visit_postId_createdAt_idx` ON `page_visit` (`postId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `page_visit_lastSeenAt_idx` ON `page_visit` (`lastSeenAt`);--> statement-breakpoint
CREATE TABLE `post` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text,
	`slugLockedAt` integer,
	`content` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`isFeatured` integer DEFAULT 0 NOT NULL,
	`featuredOrder` integer DEFAULT 0 NOT NULL,
	`categoryId` text,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer,
	`scheduledFor` integer,
	`version` integer NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_slug_unique` ON `post` (`slug`);--> statement-breakpoint
CREATE INDEX `post_createdAt_id_idx` ON `post` (`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `post_categoryId_idx` ON `post` (`categoryId`);--> statement-breakpoint
CREATE INDEX `post_status_scheduledFor_idx` ON `post` (`status`,`scheduledFor`);--> statement-breakpoint
CREATE INDEX `post_status_publishedAt_id_idx` ON `post` (`status`,`publishedAt`,`id`);--> statement-breakpoint
CREATE TABLE `post_tag` (
	`postId` text NOT NULL,
	`tagId` text NOT NULL,
	PRIMARY KEY(`postId`, `tagId`),
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `post_tag_tagId_idx` ON `post_tag` (`tagId`);--> statement-breakpoint
CREATE TABLE `release_log` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`changes` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updatedAt` integer,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `release_log_createdAt_id_idx` ON `release_log` (`createdAt`,`id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`adminId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_expiresAt_idx` ON `session` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `site_setting` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`seoDescription` text,
	`ogImageUrl` text,
	`googleVerification` text,
	`bingVerification` text,
	`baiduVerification` text,
	`authorName` text NOT NULL,
	`authorRole` text NOT NULL,
	`avatarUrl` text NOT NULL,
	`aboutMe` text NOT NULL,
	`postsPerPage` integer NOT NULL,
	`enableComments` integer NOT NULL,
	`icpText` text NOT NULL,
	`icpUrl` text NOT NULL,
	`policeText` text NOT NULL,
	`policeUrl` text NOT NULL,
	`localAnalyticsEnabled` integer,
	`localAnalyticsStartedAt` integer,
	`googleEnabled` integer NOT NULL,
	`googleId` text NOT NULL,
	`baiduEnabled` integer NOT NULL,
	`baiduId` text NOT NULL,
	`version` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_account` (
	`id` text PRIMARY KEY NOT NULL,
	`settingId` integer NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`icon` text NOT NULL,
	`imageUrl` text NOT NULL,
	`enabled` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`settingId`) REFERENCES `site_setting`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `social_account_settingId_position_idx` ON `social_account` (`settingId`,`position`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nameKey` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_nameKey_unique` ON `tag` (`nameKey`);--> statement-breakpoint
CREATE TABLE `visit_session` (
	`id` text PRIMARY KEY NOT NULL,
	`visitorHash` text NOT NULL,
	`createdAt` integer NOT NULL,
	`lastSeenAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visit_session_visitorHash_lastSeenAt_idx` ON `visit_session` (`visitorHash`,`lastSeenAt`);--> statement-breakpoint
CREATE INDEX `visit_session_createdAt_idx` ON `visit_session` (`createdAt`);--> statement-breakpoint
CREATE INDEX `visit_session_lastSeenAt_idx` ON `visit_session` (`lastSeenAt`);