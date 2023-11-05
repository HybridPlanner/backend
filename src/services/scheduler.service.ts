import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { OnEvent } from '@nestjs/event-emitter';
import { Meeting } from '@prisma/client';
import { RainbowService } from './rainbow/rainbow.service';
import { MeetingsService } from 'src/meetings/meetings.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  public constructor(
    private mailService: MailService,
    private meetingService: MeetingsService,
    private rainbowService: RainbowService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @OnEvent('meeting.create')
  public async scheduleBubbleCreation(meeting: Meeting): Promise<void> {
    const bubbleCreationDate = new Date(meeting.start_date);
    bubbleCreationDate.setMinutes(bubbleCreationDate.getMinutes() - 15);

    const job = new CronJob(bubbleCreationDate, async () => {
      const bubble = await this.rainbowService.createBubble(
        meeting.title,
        meeting.description,
      );
      await this.meetingService.update(meeting.id, {
        bubbleId: bubble.id,
      });

      this.logger.log(`Bubble ${bubble.id} created for meeting ${meeting.id}`);
    });
    job.start();

    this.schedulerRegistry.addCronJob(
      `meeting-${meeting.id}-bubble-creation`,
      job,
    );
  }
}
