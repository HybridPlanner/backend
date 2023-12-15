import { Prisma } from '@prisma/client';

export type MeetingWithAttendees = Prisma.MeetingGetPayload<{
  include: { attendees: true };
}>;

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  STARTED = 'started',
  FINISHED = 'finished',
}
