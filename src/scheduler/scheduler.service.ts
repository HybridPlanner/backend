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

/**
 * Service class for scheduling bubbles.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  /**
   * Creates an instance of the SchedulerService.
   * @param eventEmitter - The event emitter used for event handling.
   * @param schedulerRegistry - The scheduler registry used for managing schedulers.
   * @param meetingsService - The meetings service used for managing meetings.
   */
  public constructor(
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
    private meetingsService: MeetingsService,
  ) {
    this.coldBootSchedulingInit();
  }

  @OnEvent(ApplicationEvent.MEETING_CREATE)
  /**
   * Schedules the creation of a bubble for a meeting.
   * @param meeting - The meeting with attendees.
   * @returns A Promise that resolves when the bubble creation is scheduled.
   */
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
  /**
   * Schedules the start of a bubble for a meeting.
   * @param meeting - The meeting with attendees.
   * @returns A Promise that resolves when the bubble start is scheduled.
   */
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

  @OnEvent(ApplicationEvent.MEETING_CREATE)
  /**
   * Schedules the end of a bubble for a meeting.
   * @param meeting - The meeting with attendees.
   * @returns A Promise that resolves when the bubble end is scheduled.
   */
  public async scheduleBubbleEnd(meeting: MeetingWithAttendees): Promise<void> {
    const bubbleEndDate = new Date(meeting.end_date);
    const endJob = new CronJob(bubbleEndDate, async () => {
      this.eventEmitter.emit(ApplicationEvent.MEETING_END, meeting);
    });
    endJob.start();

    this.schedulerRegistry.addCronJob(
      `meeting-${meeting.id}-bubble-end`,
      endJob,
    );
  }

  @OnEvent(ApplicationEvent.MEETING_DELETE)
  /**
   * Cancels the bubble creation for a meeting.
   * @param meeting - The meeting for which the bubble creation is to be canceled.
   * @returns A promise that resolves when the bubble creation is canceled.
   */
  public async cancelBubbleCreation(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    if (
      this.schedulerRegistry.doesExist(
        'cron',
        `meeting-${meeting.id}-bubble-creation`,
      )
    ) {
      this.logger.debug(`Canceling bubble creation for meeting ${meeting.id}`);
      this.schedulerRegistry.deleteCronJob(
        `meeting-${meeting.id}-bubble-creation`,
      );
    }
  }

  @OnEvent(ApplicationEvent.MEETING_DELETE)
  /**
   * Cancels the bubble start for a meeting.
   * @param meeting - The meeting for which the bubble start is to be canceled.
   * @returns A promise that resolves when the bubble start is canceled.
   */
  public async cancelBubbleStart(meeting: MeetingWithAttendees): Promise<void> {
    if (
      this.schedulerRegistry.doesExist(
        'cron',
        `meeting-${meeting.id}-bubble-start`,
      )
    ) {
      this.logger.debug(`Canceling bubble start for meeting ${meeting.id}`);
      this.schedulerRegistry.deleteCronJob(
        `meeting-${meeting.id}-bubble-start`,
      );
    }
  }

  @OnEvent(ApplicationEvent.MEETING_DELETE)
  /**
   * Cancels the bubble end for a meeting.
   * @param meeting - The meeting for which the bubble end is to be canceled.
   * @returns A promise that resolves when the bubble end is canceled.
   */
  public async cancelBubbleEnd(meeting: MeetingWithAttendees): Promise<void> {
    if (
      this.schedulerRegistry.doesExist(
        'cron',
        `meeting-${meeting.id}-bubble-end`,
      )
    ) {
      this.logger.debug(`Canceling bubble end for meeting ${meeting.id}`);
      this.schedulerRegistry.deleteCronJob(`meeting-${meeting.id}-bubble-end`);
    }
  }

  @OnEvent(ApplicationEvent.MEETING_MANUAL_UPDATE)
  /**
   * Updates meeting cron jobs.
   *
   * Deletes the old cron jobs and schedules new ones.
   * @param meeting - The updated meeting.
   * @returns A promise that resolves when the cron jobs are updated.
   */
  public async updateMeetingCronJobs(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    this.logger.debug(`Updating cron jobs for meeting ${meeting.id}`);
    this.cancelBubbleCreation(meeting);
    this.cancelBubbleStart(meeting);
    this.cancelBubbleEnd(meeting);
    this.scheduleBubbleCreation(meeting);
    this.scheduleBubbleStart(meeting);
    this.scheduleBubbleEnd(meeting);
  }

  @OnEvent(ApplicationEvent.CONFERENCE_STOPPED)
  /**
   * Schedules bubble cleaning for a given bubble.
   * @param bubble - The bubble to schedule cleaning for.
   * @returns A promise that resolves when the bubble cleaning is scheduled.
   */
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

  @OnEvent(ApplicationEvent.CONFERENCE_STARTED)
  /**
   * Cancels the bubble cleaning for a given bubble.
   * @param bubble - The bubble for which the cleaning is to be canceled.
   * @returns A promise that resolves when the cleaning is canceled.
   */
  public async cancelBubbleCleaning(bubble: Bubble): Promise<void> {
    if (
      this.schedulerRegistry.doesExist('cron', `bubble-${bubble.id}-cleaning`)
    ) {
      this.logger.debug(`Canceling bubble cleaning for id ${bubble.id}`);
      this.schedulerRegistry.deleteCronJob(`bubble-${bubble.id}-cleaning`);
    }
  }

  /**
   * Initializes the cold boot scheduling process.
   * Retrieves all meetings and schedules bubble creation and start for each meeting.
   * @returns A Promise that resolves when the scheduling process is complete.
   */
  private async coldBootSchedulingInit(): Promise<void> {
    const meetings = await this.meetingsService.findAll(true);
    meetings.forEach(async (meeting) => {
      this.scheduleBubbleCreation(meeting);
      this.scheduleBubbleStart(meeting);
      this.scheduleBubbleEnd(meeting);
    });
  }
}
