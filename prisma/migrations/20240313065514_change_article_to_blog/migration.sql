/*
  Warnings:

  - You are about to drop the `Blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BlogToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_BlogToTag` DROP FOREIGN KEY `_BlogToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BlogToTag` DROP FOREIGN KEY `_BlogToTag_B_fkey`;

-- DropTable
DROP TABLE `Blog`;

-- DropTable
DROP TABLE `_BlogToTag`;

-- CreateTable
CREATE TABLE `Blog` (
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `cover` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Blog_title_key`(`title`),
    UNIQUE INDEX `Blog_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BlogToTag` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BlogToTag_AB_unique`(`A`, `B`),
    INDEX `_BlogToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_BlogToTag` ADD CONSTRAINT `_BlogToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlogToTag` ADD CONSTRAINT `_BlogToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
