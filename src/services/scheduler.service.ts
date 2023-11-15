import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { MeetingWithAttendees } from 'src/meetings/meetings.type';

@Injectable()
export class SchedulerService {
  public constructor(
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @OnEvent('meeting.create')
  public async scheduleBubbleCreation(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const bubbleCreationDate = new Date(meeting.start_date);
    bubbleCreationDate.setMinutes(bubbleCreationDate.getMinutes() - 15);

    const job = new CronJob(bubbleCreationDate, async () => {
      this.eventEmitter.emit('meeting.beforeStart', meeting);
    });
    job.start();

    this.schedulerRegistry.addCronJob(
      `meeting-${meeting.id}-bubble-creation`,
      job,
    );
  }
}
