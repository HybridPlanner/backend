-- CreateTable
CREATE TABLE "Meeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bubbleId" TEXT,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "publicUrl" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_email_key" ON "Attendee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AttendeeToMeeting_AB_unique" ON "_AttendeeToMeeting"("A", "B");

-- CreateIndex
CREATE INDEX "_AttendeeToMeeting_B_index" ON "_AttendeeToMeeting"("B");
