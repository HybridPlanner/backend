import { Logger } from '@nestjs/common';
import { Meeting } from '@prisma/client';
import * as ics from 'ics';
import { DatabaseService } from 'src/services/database/database.service';

export async function createIcsFile(
  meeting: Meeting,
  prisma: DatabaseService,
): Promise<string> {
  const meetingWithAttendees = await prisma.meeting.findUnique({
    where: { id: meeting.id },
    include: { attendees: true },
  });

  const { error, value } = ics.createEvent({
    start: [
      meeting.start_date.getFullYear(),
      meeting.start_date.getMonth() + 1, // 0 = January, 1 = February, ...
      meeting.start_date.getDate(),
      meeting.start_date.getHours(),
      meeting.start_date.getMinutes(),
    ],
    end: [
      meeting.end_date.getFullYear(),
      meeting.end_date.getMonth() + 1,
      meeting.end_date.getDate(),
      meeting.end_date.getHours(),
      meeting.end_date.getMinutes(),
    ],
    title: meeting.title,
    description: meeting.description,
    location: 'Rainbow application - Remote',
    attendees: meetingWithAttendees.attendees.map((attendee) => ({
      email: attendee.email,
      rsvp: true,
      partstat: 'NEEDS-ACTION',
    })),
    url: process.env.URL_FRONTEND + `/meeting/${meeting.id}`,
  });

  if (error) {
    Logger.error(`Error creating ics file: ${error}`);
    return;
  }

  return value;
}
