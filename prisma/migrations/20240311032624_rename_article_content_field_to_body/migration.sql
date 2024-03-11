/*
  Warnings:

  - You are about to drop the column `content` on the `Article` table. All the data in the column will be lost.
  - Added the required column `body` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Article` DROP COLUMN `content`,
    ADD COLUMN `body` TEXT NOT NULL;
