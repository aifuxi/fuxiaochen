-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `snippetId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Snippet` (
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Snippet_title_key`(`title`),
    UNIQUE INDEX `Snippet_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_snippetId_fkey` FOREIGN KEY (`snippetId`) REFERENCES `Snippet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
