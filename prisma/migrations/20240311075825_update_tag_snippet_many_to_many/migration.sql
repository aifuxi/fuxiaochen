/*
  Warnings:

  - You are about to drop the column `snippetId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_snippetId_fkey`;

-- AlterTable
ALTER TABLE `Tag` DROP COLUMN `snippetId`;

-- CreateTable
CREATE TABLE `_SnippetToTag` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SnippetToTag_AB_unique`(`A`, `B`),
    INDEX `_SnippetToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_SnippetToTag` ADD CONSTRAINT `_SnippetToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Snippet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SnippetToTag` ADD CONSTRAINT `_SnippetToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
