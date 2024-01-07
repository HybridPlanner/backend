/*
  Warnings:

  - You are about to drop the column `started` on the `Meeting` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bubbleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "publicUrl" TEXT
);
INSERT INTO "new_Meeting" ("bubbleId", "createdAt", "description", "end_date", "id", "publicUrl", "start_date", "status", "title", "updatedAt") SELECT "bubbleId", "createdAt", "description", "end_date", "id", "publicUrl", "start_date", "status", "title", "updatedAt" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
