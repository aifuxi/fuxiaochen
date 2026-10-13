CREATE TABLE `auth_account` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`password` text,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_account_userId_idx` ON `auth_account` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_account_provider_account_unique` ON `auth_account` (`providerId`,`accountId`);--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_session_token_unique` ON `auth_session` (`token`);--> statement-breakpoint
CREATE INDEX `auth_session_userId_idx` ON `auth_session` (`userId`);--> statement-breakpoint
CREATE INDEX `auth_session_expiresAt_idx` ON `auth_session` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`username` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_email_unique` ON `auth_user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_username_unique` ON `auth_user` (`username`);--> statement-breakpoint
CREATE TABLE `auth_verification` (
	`id` integer PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_verification_identifier_idx` ON `auth_verification` (`identifier`);
--> statement-breakpoint
-- 迁移唯一管理员及原 Argon2id 哈希，不改变密码；旧会话全部撤销。
INSERT INTO auth_user (id, name, email, emailVerified, image, username, createdAt, updatedAt)
SELECT id, username, 'admin@localhost.invalid', 0, NULL, username, createdAt, updatedAt FROM admin WHERE id = 1;
--> statement-breakpoint
INSERT INTO auth_account (id, userId, accountId, providerId, password, createdAt, updatedAt)
SELECT 1, id, '1', 'credential', passwordHash, createdAt, updatedAt FROM admin WHERE id = 1;
--> statement-breakpoint
DELETE FROM session;
