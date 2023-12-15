import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { MeetingWithAttendees } from 'src/meetings/meetings.type';
import { addMinutes, isBefore, subMinutes } from 'date-fns';
import { ApplicationEvent } from 'src/types/MeetingEvents';
import { Bubble } from 'rainbow-node-sdk/lib/common/models/Bubble';
import { MeetingsService } from 'src/meetings/meetings.service';

const MINUTES_BEFORE_MEETING_START = 15;
const MINUTES_BEFORE_MEETING_CLEANING = 30;

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  public constructor(
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
    private meetingsService: MeetingsService,
  ) {
    this.coldBootSchedulingInit();
  }

  @OnEvent(ApplicationEvent.MEETING_CREATE)
  public async scheduleBubbleCreation(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    this.logger.debug(`Scheduling bubble creation for meeting ${meeting.id}`);
    const bubbleStartDate = new Date(meeting.start_date);
    const bubbleCreationDate = subMinutes(
      bubbleStartDate,
      MINUTES_BEFORE_MEETING_START,
    );

    if (isBefore(bubbleCreationDate, new Date())) {
      this.logger.debug(
        "Creating bubble now because it's less than 15 minutes before meeting start",
      );
      this.eventEmitter.emit(ApplicationEvent.MEETING_BEFORE_START, meeting);
      return;
    }

    // Schedule bubble creation 15 minutes before meeting start
    this.logger.debug('Scheduling bubble creation');
    const creationJob = new CronJob(bubbleCreationDate, async () => {
      this.eventEmitter.emit(ApplicationEvent.MEETING_BEFORE_START, meeting);
    });
    creationJob.start();

    this.schedulerRegistry.addCronJob(
      `meeting-${meeting.id}-bubble-creation`,
      creationJob,
    );
  }

  @OnEvent(ApplicationEvent.MEETING_CREATE)
  public async scheduleBubbleStart(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    const bubbleStartDate = new Date(meeting.start_date);
    const startJob = new CronJob(bubbleStartDate, async () => {
      this.eventEmitter.emit(ApplicationEvent.MEETING_START, meeting);
    });
    startJob.start();

    this.schedulerRegistry.addCronJob(
      `meeting-${meeting.id}-bubble-start`,
      startJob,
    );
  }

  @OnEvent(ApplicationEvent.MEETING_END)
  public async scheduleBubbleCleaning(bubble: Bubble): Promise<void> {
    this.logger.debug(`Scheduling bubble cleaning for id ${bubble.id}`);

    const bubbleCleaningDate = addMinutes(
      new Date(),
      MINUTES_BEFORE_MEETING_CLEANING,
    );

    const cleaningJob = new CronJob(bubbleCleaningDate, async () => {
      this.eventEmitter.emit(ApplicationEvent.MEETING_CLEANING, bubble);
    });
    cleaningJob.start();

    this.schedulerRegistry.addCronJob(
      `bubble-${bubble.id}-cleaning`,
      cleaningJob,
    );
  }

  @OnEvent(ApplicationEvent.MEETING_CANCEL_END)
  public async cancelBubbleCleaning(bubble: Bubble): Promise<void> {
    this.schedulerRegistry.deleteCronJob(`bubble-${bubble.id}-cleaning`);
  }

  /**
   * This method is called when the application starts. It is used to restore the scheduled jobs from the database.
   */
  private async coldBootSchedulingInit(): Promise<void> {
    const meetings = await this.meetingsService.findAll(true);
    meetings.forEach(async (meeting) => {
      this.scheduleBubbleCreation(meeting);
      this.scheduleBubbleStart(meeting);
    });
  }
}
