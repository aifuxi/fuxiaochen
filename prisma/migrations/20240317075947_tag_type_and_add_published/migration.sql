-- AlterTable
ALTER TABLE `Note` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Snippet` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `type` ENUM('ALL', 'BLOG', 'SIPPET', 'NOTE') NOT NULL DEFAULT 'ALL';
