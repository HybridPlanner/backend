import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Meeting } from '@prisma/client';
import { DatabaseService } from 'src/services/database/database.service';
import { createIcsFile } from 'src/utils/ics-util';
@Injectable()
export class MailService {
  public constructor(private mailerService: MailerService, private database: DatabaseService) {}

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
    meeting: Meeting,
  ): Promise<void> {

    const meetingWithAttendees = await this.database.meeting.findUnique({
      where: { id: meeting.id },
      include: { attendees: true },
    });

    const icsFile = await createIcsFile(meeting, this.database);
    const url = `http://localhost:5173/meeting/${meeting.id}`;
    const fileName = `meeting-${meeting.title.replace(/[^a-zA-Z0-9]/g, '')}.ics`; // remove special characters from title

    await Promise.all(
      meetingWithAttendees.attendees.map((attendee) =>
        this.mailerService.sendMail({
          to: attendee.email,
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
        }),
      ),
    );
  }
}
