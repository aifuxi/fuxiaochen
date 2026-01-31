-- AlterTable
ALTER TABLE `account` MODIFY `accessToken` TEXT NULL,
    MODIFY `refreshToken` TEXT NULL,
    MODIFY `idToken` TEXT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` TEXT NULL,
    ADD COLUMN `role` ENUM('admin', 'visitor') NOT NULL DEFAULT 'visitor',
    MODIFY `image` TEXT NULL;

-- AlterTable
ALTER TABLE `verification` MODIFY `identifier` TEXT NOT NULL,
    MODIFY `value` TEXT NOT NULL;
