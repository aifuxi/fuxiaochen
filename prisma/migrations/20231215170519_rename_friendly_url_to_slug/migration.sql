/*
  Warnings:

  - You are about to drop the column `friendlyURL` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `friendlyURL` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `slug` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Article" ("content", "cover", "createdAt", "description", "id", "published", "title", "updatedAt") SELECT "content", "cover", "createdAt", "description", "id", "published", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_title_key" ON "Article"("title");
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE TABLE "new_Tag" (
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tag" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
