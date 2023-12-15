import { Prisma } from '@prisma/client';

export type MeetingWithAttendees = Prisma.MeetingGetPayload<{
  include: { attendees: true };
}>;

/**
 * Enum representing the status of a meeting.
 */
export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  STARTED = 'started',
  FINISHED = 'finished',
}
