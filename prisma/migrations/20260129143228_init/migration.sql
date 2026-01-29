/*
  Warnings:

  - You are about to drop the column `categoryId` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `changelogs` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `changelogs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `changelogs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `_BlogToTag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `changelogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_BlogToTag` DROP FOREIGN KEY `_BlogToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BlogToTag` DROP FOREIGN KEY `_BlogToTag_B_fkey`;

-- DropForeignKey
ALTER TABLE `blogs` DROP FOREIGN KEY `blogs_categoryId_fkey`;

-- DropIndex
DROP INDEX `blogs_categoryId_fkey` ON `blogs`;

-- AlterTable
ALTER TABLE `blogs` DROP COLUMN `categoryId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `publishedAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `category_id` BIGINT NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `published_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `createdAt`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `changelogs` DROP COLUMN `createdAt`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `date` BIGINT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `tags` DROP COLUMN `createdAt`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `_BlogToTag`;

-- CreateTable
CREATE TABLE `blog_tags` (
    `blog_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,

    PRIMARY KEY (`blog_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tags` ADD CONSTRAINT `blog_tags_blog_id_fkey` FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tags` ADD CONSTRAINT `blog_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
