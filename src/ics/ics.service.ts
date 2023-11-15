import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as ics from 'ics';
import { MeetingWithAttendees } from 'src/meetings/meetings.type';

@Injectable()
export class IcsService {
  private readonly logger = new Logger(IcsService.name);

  public async createIcsFile(meeting: MeetingWithAttendees): Promise<string> {
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
      attendees: meeting.attendees.map((attendee) => ({
        email: attendee.email,
        rsvp: true,
        partstat: 'NEEDS-ACTION',
      })),
      url: process.env.URL_FRONTEND + `/meeting/${meeting.id}`,
    });

    if (error) {
      this.logger.error(`Error creating ics file: ${error.message}`);
      return;
    }

    return value;
  }
}
