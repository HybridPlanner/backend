import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { isBefore } from 'date-fns';
import { Bubble } from 'rainbow-node-sdk/lib/common/models/Bubble';
import { IcsService } from 'src/ics/ics.service';
import { MeetingsService } from 'src/meetings/meetings.service';
import { MeetingWithAttendees } from 'src/meetings/meetings.type';
import { ApplicationEvent } from 'src/types/MeetingEvents';

/**
 * Service responsible for sending mails.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  public constructor(
    private mailerService: MailerService,
    private meetingService: MeetingsService,
    private icsService: IcsService,
  ) {}

  @OnEvent('user.create')
  /**
   * Sends a user confirmation email.
   * @param to - The email address of the recipient.
   * @returns A Promise that resolves when the email is sent successfully, or rejects if there is an error.
   */
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

  @OnEvent(ApplicationEvent.MEETING_CREATE)
  /**
   * Sends a meeting invitation email to the attendees.
   * @param meeting - The meeting object containing the details of the meeting and attendees.
   * @returns A Promise that resolves when the email is sent successfully.
   */
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

  @OnEvent(ApplicationEvent.MEETING_BEFORE_START)
  /**
   * Sends a reminder email to the attendees before a meeting.
   * @param meeting - The meeting object.
   * @returns A Promise that resolves when the email is sent successfully.
   */
  public async sendMailBeforeMeeting(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const attendeesMails: string[] = meeting.attendees.map((a) => a.email);
    const icsFile = await this.icsService.createIcsFile(meeting);
    const url = process.env.URL_FRONTEND + `/meeting/${meeting.id}`;
    const fileName = `meeting-${meeting.title.replace(
      /[^a-zA-Z0-9]/g,
      '',
    )}.ics`; // remove special characters from title

    this.mailerService.sendMail({
      bcc: attendeesMails,
      subject: "Don't forget your meeting !",
      template: 'meetings/reminder',
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

  @OnEvent(ApplicationEvent.MEETING_START)
  /**
   * Sends an email to the attendees when a meeting starts.
   * @param meeting - The meeting object.
   * @returns A Promise that resolves when the email is sent successfully.
   */
  public async sendMailMeetingStarted(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const attendeesMails: string[] = meeting.attendees.map((a) => a.email);
    const url = process.env.URL_FRONTEND + `/meeting/${meeting.id}`;

    this.mailerService.sendMail({
      bcc: attendeesMails,
      subject: 'Your meeting has started',
      template: 'meetings/start',
      context: {
        meeting,
        url,
      },
    });
  }

  @OnEvent(ApplicationEvent.MEETING_MANUAL_UPDATE)
  /**
   * Sends an email notification to the attendees when a meeting is updated.
   * @param meeting - The meeting that has been updated.
   * @returns A Promise that resolves when the email has been sent.
   */
  public async sendMailMeetingUpdated(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const attendeesMails: string[] = meeting.attendees.map((a) => a.email);
    const icsFile = await this.icsService.createIcsFile(meeting);
    const url = process.env.URL_FRONTEND + `/meeting/${meeting.id}`;
    const fileName = `meeting-${meeting.title.replace(
      /[^a-zA-Z0-9]/g,
      '',
    )}.ics`; // remove special characters from title

    this.mailerService.sendMail({
      bcc: attendeesMails,
      subject: 'Your meeting has been updated',
      template: 'meetings/update',
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

  @OnEvent(ApplicationEvent.MEETING_DELETE)
  /**
   * Sends an email notification to the attendees when a meeting is cancelled.
   * @param meeting - The meeting that has been cancelled.
   * @returns A Promise that resolves when the email has been sent.
   */
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

  @OnEvent(ApplicationEvent.CONFERENCE_STOPPED)
  public async sendMeetingSummary(bubble: Bubble): Promise<void> {
    const meeting = await this.meetingService.findMeetingByBubbleId(bubble.id);
    const messages = await this.meetingService.getMessages(meeting);
    this.mailerService.sendMail({
      bcc: meeting.attendees.map((attendee) => attendee.email),
      subject: 'Your meeting summary',
      template: 'meetings/summary',
      context: {
        meeting,
        messages,
      },
    });
  }
}
