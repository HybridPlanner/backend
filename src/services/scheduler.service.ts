import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { MeetingWithAttendees } from 'src/meetings/meetings.type';
import { isBefore, subMinutes } from 'date-fns';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  public constructor(
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.coldBootSchedulingInit();
  }

  @OnEvent('meeting.create')
  public async scheduleBubbleCreation(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    this.logger.debug(`Scheduling bubble creation for meeting ${meeting.id}`);
    // schedule bubble creation 15 minutes before meeting start
    // if meeting is created less than 15 minutes before start, schedule it now
    const bubbleStartDate = new Date(meeting.start_date);
    const bubbleCreationDate = subMinutes(bubbleStartDate, 15);

    // Are we after the bubble creation date?
    if (isBefore(bubbleCreationDate, new Date())) {
      this.logger.debug(
        "Creating bubble now because it's less than 15 minutes before meeting start",
      );
      this.eventEmitter.emit('meeting.beforeStart', meeting);
    } else {
      this.logger.debug('Scheduling bubble creation');
      const creationJob = new CronJob(bubbleCreationDate, async () => {
        this.eventEmitter.emit('meeting.beforeStart', meeting);
      });
      creationJob.start();

      this.schedulerRegistry.addCronJob(
        `meeting-${meeting.id}-bubble-creation`,
        creationJob,
      );
    }

    // schedule bubble call start at meeting start
    const startJob = new CronJob(bubbleStartDate, async () => {
      this.eventEmitter.emit('meeting.start', meeting);
    });
    startJob.start();

    this.schedulerRegistry.addCronJob(
      `meeting-${meeting.id}-bubble-start`,
      startJob,
    );
  }

  /**
   * This method is called when the application starts. It is used to restore the scheduled jobs from the database.
   */
  private coldBootSchedulingInit(): void {}
}
