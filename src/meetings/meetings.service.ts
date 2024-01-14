import { Injectable, Logger } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { DatabaseService } from 'src/database/database.service';
import { Attendee, Meeting } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MeetingStatus, MeetingWithAttendees } from './meetings.type';
import { RainbowService } from 'src/rainbow/rainbow.service';
import { Observable, Subject } from 'rxjs';
import { ApplicationEvent } from 'src/types/MeetingEvents';
import { Bubble } from 'rainbow-node-sdk/lib/common/models/Bubble';
import { Message } from 'rainbow-node-sdk/lib/common/models/Message';

export type MeetingEvent =
  | { type: 'bubbleCreated'; id: number; meeting: MeetingWithAttendees }
  | { type: 'updated'; id: number; meeting: MeetingWithAttendees }
  | { type: 'cancelled'; id: number }
  | { type: 'started'; id: number; url: string };

/**
 * Service for managing meetings.
 */
@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);
  private readonly _meetings = new Subject<MeetingEvent>();

  public get meetings(): Observable<MeetingEvent> {
    return this._meetings.asObservable();
  }

  public constructor(
    private database: DatabaseService,
    private eventEmitter: EventEmitter2,
    private rainbow: RainbowService,
  ) {}

  /**
   * Creates a new meeting with attendees.
   * @param createMeetingDto - The data for creating the meeting.
   * @returns A promise that resolves to the created meeting with attendees.
   */
  public async create(
    createMeetingDto: CreateMeetingDto,
  ): Promise<MeetingWithAttendees> {
    const meeting: MeetingWithAttendees = await this.database.meeting.create({
      data: {
        ...createMeetingDto,
        attendees: {
          connectOrCreate: createMeetingDto.attendees.map((email) => ({
            where: {
              email,
            },
            create: {
              email,
            },
          })),
        },
      },
      include: {
        attendees: true,
      },
    });
    this.eventEmitter.emit(ApplicationEvent.MEETING_CREATE, meeting);
    return meeting;
  }

  /**
   * Retrieves all meetings from the database.
   * @param withAttendees - Indicates whether to include attendees in the result.
   * @returns A promise that resolves to an array of MeetingWithAttendees objects.
   */
  public findAll(
    withAttendees: boolean = false,
  ): Promise<MeetingWithAttendees[]> {
    return this.database.meeting.findMany({
      where: {
        end_date: {
          gte: new Date(),
        },
      },
      include: {
        attendees: withAttendees,
      },
      orderBy: {
        end_date: 'desc',
      },
    });
  }

  /**
   * Retrieves a list of previous meetings based on a given date.
   * @param previous - The date to compare against.
   * @param limit - The maximum number of meetings to retrieve (default: 5).
   * @returns A promise that resolves to an array of Meeting objects.
   */
  public findAllPrevious(previous: Date, limit = 5): Promise<Meeting[]> {
    return this.database.meeting.findMany({
      take: limit,
      where: {
        end_date: {
          lt: previous,
        },
      },
      orderBy: {
        end_date: 'desc',
      },
    });
  }

  /**
   * Finds attendees based on their email.
   * @param email - The email to search for.
   * @returns A promise that resolves to an array of Attendee objects.
   */
  public findAttendees(email: string): Promise<Attendee[]> {
    return this.database.attendee.findMany({
      where: {
        email: {
          contains: email,
        },
      },
    });
  }

  /**
   * Retrieves a meeting by its ID.
   * @param id - The ID of the meeting.
   * @returns A Promise that resolves to the meeting object if found, or null if not found.
   */
  public findOne(id: number): Promise<Meeting | null> {
    return this.database.meeting.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Retrieves a meeting with its attendees by ID.
   * @param id - The ID of the meeting.
   * @returns A Promise that resolves to a MeetingWithAttendees object if found, or null if not found.
   */
  public findOneWithAttendees(
    id: number,
  ): Promise<MeetingWithAttendees | null> {
    return this.database.meeting.findUnique({
      where: {
        id,
      },
      include: {
        attendees: true,
      },
    });
  }

  /**
   * Finds a meeting by bubble ID.
   * @param bubbleId - The ID of the bubble.
   * @returns A promise that resolves to the found meeting or null if not found.
   */
  public findMeetingByBubbleId(
    bubbleId: string,
  ): Promise<MeetingWithAttendees | null> {
    return this.database.meeting.findFirst({
      where: {
        bubbleId,
      },
      include: {
        attendees: true,
      },
    });
  }

  /**
   * Updates a meeting with the specified ID.
   * @param id - The ID of the meeting to update.
   * @param updateMeetingDto - The data to update the meeting with.
   * @returns A Promise that resolves to the updated meeting.
   */
  public async update(
    id: number,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    const meeting = await this.database.meeting.update({
      where: {
        id,
      },
      data: {
        ...updateMeetingDto,
        ...(updateMeetingDto.start_date && {
          start_date: new Date(updateMeetingDto.start_date),
        }),
        ...(updateMeetingDto.end_date && {
          end_date: new Date(updateMeetingDto.end_date),
        }),
        attendees: {
          connectOrCreate: updateMeetingDto.attendees?.map((email) => ({
            where: {
              email,
            },
            create: {
              email,
            },
          })),
        },
      },
      include: {
        attendees: true,
      },
    });

    this._meetings.next({
      type: 'updated',
      id: meeting.id,
      meeting,
    });
    this.eventEmitter.emit(ApplicationEvent.MEETING_UPDATE, meeting);
    return meeting;
  }

  /**
   * Deletes a meeting with the specified ID.
   * @param id - The ID of the meeting to delete.
   * @returns A Promise that resolves to the deleted meeting.
   */
  public async delete(id: number): Promise<Meeting> {
    const meeting: MeetingWithAttendees = await this.database.meeting.delete({
      where: {
        id,
      },
      include: {
        attendees: true,
      },
    });
    this._meetings.next({
      type: 'cancelled',
      id: meeting.id,
    });
    this.eventEmitter.emit(ApplicationEvent.MEETING_DELETE, meeting);
    return meeting;
  }

  /**
   * Retrieves the messages from a meeting.
   * @param meeting - The meeting object.
   * @returns A promise that resolves to an array of messages.
   */
  public async getMessages(meeting: MeetingWithAttendees): Promise<Message[]> {
    const messages = await this.rainbow.getMessagesFromBubbleId(
      meeting.bubbleId,
    );
    return messages;
  }

  @OnEvent(ApplicationEvent.MEETING_START)
  /**
   * Calls a meeting bubble.
   * @param meeting - The meeting object.
   * @returns A promise that resolves when the bubble is called.
   */
  public async callMeetingBubble(meeting: MeetingWithAttendees): Promise<void> {
    // Retrieve the meeting data to load the bubble ID
    const meetingData = await this.findOne(meeting.id);

    this.logger.debug(`Calling bubble for meeting "${meetingData.id}"`);
    const bubble = this.rainbow.getBubbleByID(meetingData.bubbleId);
    await this.rainbow.callBubble(bubble);
  }

  @OnEvent(ApplicationEvent.CONFERENCE_STARTED)
  /**
   * Starts a meeting by updating its status and marking it as started.
   * @param meeting - The meeting to be started.
   * @returns A promise that resolves when the meeting has been successfully started.
   */
  public async startMeeting(bubble: Bubble): Promise<void> {
    const meeting = await this.findMeetingByBubbleId(bubble.id);
    if (!meeting) return;

    // Update the meeting status
    this.logger.debug(`Starting meeting "${meeting.id}"`);
    await this.database.meeting.update({
      where: { id: meeting.id },
      data: { status: MeetingStatus.STARTED },
    });

    this._meetings.next({
      type: 'started',
      id: meeting.id,
      url: meeting.publicUrl,
    });
  }

  @OnEvent(ApplicationEvent.CONFERENCE_STOPPED)
  /**
   * Ends a meeting by updating its status and marking it as finished.
   * @param meeting - The meeting to be ended.
   * @returns A promise that resolves when the meeting has been successfully ended.
   */
  public async endMeeting(bubble: Bubble): Promise<void> {
    const meeting = await this.findMeetingByBubbleId(bubble.id);
    this.logger.debug(`Ending meeting "${meeting.id}"`);

    await this.database.meeting.update({
      where: { id: meeting.id },
      data: { status: MeetingStatus.FINISHED },
    });
  }

  @OnEvent(ApplicationEvent.MEETING_BEFORE_START)
  /**
   * Creates a bubble before a meeting.
   * @param meeting - The meeting with attendees.
   * @returns A Promise that resolves to void.
   */
  public async createBubbleBeforeMeeting(
    meeting: MeetingWithAttendees,
  ): Promise<void> {
    this.logger.debug(`Creating bubble for meeting "${meeting.id}"`);
    const bubble = await this.rainbow.createBubble(meeting.title);

    this.logger.debug(`Fetching bubble public URL for meeting "${meeting.id}"`);
    const publicUrl = await this.rainbow.getBubblePublicUrl(bubble);
    await this.update(meeting.id, {
      bubbleId: bubble.id,
      publicUrl,
      status: MeetingStatus.SCHEDULED,
    });

    this._meetings.next({
      type: 'bubbleCreated',
      id: meeting.id,
      meeting: {
        ...meeting,
        bubbleId: bubble.id,
        publicUrl,
      },
    });

    this.logger.log(`Bubble ${bubble.id} created for meeting ${meeting.id}`);
  }

  @OnEvent(ApplicationEvent.MEETING_CLEANING)
  /**
   * Deletes a bubble after a meeting has finished.
   * @param bubble - The bubble to be deleted.
   * @returns A promise that resolves when the bubble is deleted.
   */
  public async deleteBubbleAfterMeeting(bubble: Bubble): Promise<void> {
    const meeting = await this.database.meeting.findFirst({
      where: {
        bubbleId: bubble.id,
      },
    });
    this.update(meeting.id, {
      status: MeetingStatus.FINISHED,
    });
    await this.rainbow.deleteBubble(bubble);
  }

  @OnEvent(ApplicationEvent.MEETING_DELETE)
  /**
   * Deletes the bubble associated with a meeting.
   * @param meeting - The meeting object containing the bubble information.
   * @returns A Promise that resolves when the bubble is successfully deleted.
   */
  public async deleteBubble(meeting: MeetingWithAttendees): Promise<void> {
    this.logger.debug(`Deleting bubble for meeting "${meeting.id}"`);
    const bubble = this.rainbow.getBubbleByID(meeting.bubbleId);
    await this.rainbow.deleteBubble(bubble);
  }

  @OnEvent(ApplicationEvent.MEETING_UPDATE)
  /**
   * Updates the bubble for a meeting.
   * @param meeting - The meeting object containing the updated information.
   * @returns A Promise that resolves to void.
   */
  public async updateBubble(meeting: MeetingWithAttendees): Promise<void> {
    this.logger.debug(`Updating bubble for meeting "${meeting.id}"`);
    const bubble = this.rainbow.getBubbleByID(meeting.bubbleId);
    await this.rainbow.updateBubble(bubble.id, meeting.title);
  }
}
