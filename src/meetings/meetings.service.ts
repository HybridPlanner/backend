import { Injectable, Logger } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { DatabaseService } from 'src/database/database.service';
import { Attendee, Meeting } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MeetingWithAttendees } from './meetings.type';
import { RainbowService } from 'src/rainbow/rainbow.service';
import { Observable, Subject } from 'rxjs';
import { ApplicationEvent } from 'src/types/MeetingEvents';

export type MeetingEvent =
  | { type: 'bubbleCreated'; id: number; meeting: MeetingWithAttendees }
  | { type: 'updated'; id: number; meeting: MeetingWithAttendees }
  | { type: 'cancelled'; id: number }
  | { type: 'started'; id: number; url: string };

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

  public async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    const meeting: Meeting = await this.database.meeting.create({
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
    });
    const meetingWithAttendees = await this.findOneWithAttendees(meeting.id);
    this.eventEmitter.emit(
      ApplicationEvent.MEETING_CREATE,
      meetingWithAttendees,
    );
    return meeting;
  }

  public findAll(limit?: number): Promise<Meeting[]> {
    return this.database.meeting.findMany({
      take: limit,
      where: {
        start_date: {
          gte: new Date(),
        },
      },
    });
  }

  public findAllPrevious(previous: Date, limit?: number): Promise<Meeting[]> {
    return this.database.meeting.findMany({
      take: limit,
      where: {
        start_date: {
          lt: previous,
        },
      },
    });
  }

  public findAttendees(email: string): Promise<Attendee[]> {
    return this.database.attendee.findMany({
      where: {
        email: {
          contains: email,
        },
      },
    });
  }

  public findOne(id: number): Promise<Meeting | null> {
    return this.database.meeting.findUnique({
      where: {
        id,
      },
    });
  }

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
    });

    this._meetings.next({
      type: 'updated',
      id: meeting.id,
      meeting: await this.findOneWithAttendees(meeting.id),
    });
    this.eventEmitter.emit(ApplicationEvent.MEETING_UPDATE, meeting);
    return meeting;
  }

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

  @OnEvent(ApplicationEvent.MEETING_START)
  public async startMeeting(meeting: MeetingWithAttendees): Promise<void> {
    this.logger.debug(`Starting meeting "${meeting.id}"`);

    const meetingData = await this.database.meeting.findUniqueOrThrow({
      where: { id: meeting.id },
      include: { attendees: true },
    });

    const bubble = this.rainbow.getBubbleByID(meetingData.bubbleId);

    await this.rainbow.callBubble(bubble);

    // Update the meeting status
    await this.database.meeting.update({
      where: { id: meeting.id },
      data: { started: true },
    });

    this._meetings.next({
      type: 'started',
      id: meetingData.id,
      url: meetingData.publicUrl,
    });
  }

  @OnEvent(ApplicationEvent.MEETING_BEFORE_START)
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
}
