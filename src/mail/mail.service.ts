import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { isBefore } from 'date-fns';
import { IcsService } from 'src/ics/ics.service';
import { MeetingWithAttendees } from 'src/meetings/meetings.type';
@Injectable()
export class MailService {
  public constructor(
    private mailerService: MailerService,
    private icsService: IcsService,
  ) {}

  @OnEvent('user.create')
  public async sendUserConfirmation(to: string): Promise<void> {
    const url = `example.com/auth/confirm`;

    this.mailerService
      .sendMail({
        to: to,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Hybrid Planner! Confirm your Email',
        template: 'confirmation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: 'John Doe',
          url,
        },
      })
      .then(() => {
        Logger.log(`Confirmation email sent`);
      })
      .catch(() => {
        Logger.error(`Confirmation email failed`);
      });
  }

  @OnEvent('meeting.create')
  public async sendMeetingInvitation(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const icsFile = await this.icsService.createIcsFile(meeting);
    const url = process.env.URL_FRONTEND + `/meeting/${meeting.id}`;
    const fileName = `meeting-${meeting.title.replace(
      /[^a-zA-Z0-9]/g,
      '',
    )}.ics`; // remove special characters from title

    this.mailerService.sendMail({
      bcc: meeting.attendees.map((attendee) => attendee.email),
      subject: 'You are invited to a meeting',
      template: 'meetings/invitation',
      context: {
        meeting,
        url,
      },
      attachments: [
        {
          filename: fileName,
          content: Buffer.from(icsFile, 'utf-8'),
          contentType: 'text/calendar',
        },
      ],
    });
  }

  @OnEvent('meeting.beforeStart')
  public async sendMailBeforeMeeting(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const attendeesMails: string[] = meeting.attendees.map((a) => a.email);
    const url = process.env.URL_FRONTEND + `/meeting/${meeting.id}`;

    this.mailerService.sendMail({
      bcc: attendeesMails,
      subject: "Don't forget your meeting !",
      template: 'meetings/reminder',
      context: {
        meeting,
        url,
      },
    });
  }

  @OnEvent('meeting.delete')
  public async sendMailMeetingCancelled(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const now = new Date();

    if (isBefore(meeting.end_date, now)) return;

    const attendeesMails: string[] = meeting.attendees.map((a) => a.email);

    this.mailerService.sendMail({
      bcc: attendeesMails,
      subject: 'Your meeting has been cancelled',
      template: 'meetings/cancellation',
      context: {
        meeting,
      },
    });
  }
}
