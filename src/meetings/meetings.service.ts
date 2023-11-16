import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { DatabaseService } from 'src/services/database/database.service';
import { Attendee, Meeting } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MeetingWithAttendees } from './meetings.type';

@Injectable()
export class MeetingsService {
  public constructor(
    private database: DatabaseService,
    private eventEmitter: EventEmitter2,
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
    this.eventEmitter.emit('meeting.create', meetingWithAttendees);
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

  public findOne(id: number): Promise<Meeting> {
    return this.database.meeting.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  public findOneWithAttendees(id: number): Promise<MeetingWithAttendees> {
    return this.database.meeting.findUniqueOrThrow({
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

    this.eventEmitter.emit('meeting.update', meeting);
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
    this.eventEmitter.emit('meeting.delete', meeting);
    return meeting;
  }
}
