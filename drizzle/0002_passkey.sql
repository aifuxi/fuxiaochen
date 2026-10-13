CREATE TABLE `auth_passkey` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`name` text,
	`publicKey` text NOT NULL,
	`credentialID` text NOT NULL,
	`counter` integer NOT NULL,
	`deviceType` text NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text,
	`createdAt` integer,
	`aaguid` text,
	FOREIGN KEY (`userId`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_passkey_credentialID_unique` ON `auth_passkey` (`credentialID`);--> statement-breakpoint
CREATE INDEX `auth_passkey_userId_idx` ON `auth_passkey` (`userId`);