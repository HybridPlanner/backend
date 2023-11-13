import { Prisma } from '@prisma/client';

export type MeetingWithAttendees = Prisma.MeetingGetPayload<{
  include: { attendees: true };
}>;
