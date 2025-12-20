-- AlterTable
ALTER TABLE `blog` MODIFY `body` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `tag` MODIFY `icon` TEXT NULL,
    MODIFY `iconDark` TEXT NULL;
