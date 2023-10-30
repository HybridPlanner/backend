/*
  Warnings:

  - You are about to drop the `_MeetingToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MeetingToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Attendee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttendeeToMeeting" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AttendeeToMeeting_A_fkey" FOREIGN KEY ("A") REFERENCES "Attendee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AttendeeToMeeting_B_fkey" FOREIGN KEY ("B") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_email_key" ON "Attendee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AttendeeToMeeting_AB_unique" ON "_AttendeeToMeeting"("A", "B");

-- CreateIndex
CREATE INDEX "_AttendeeToMeeting_B_index" ON "_AttendeeToMeeting"("B");
