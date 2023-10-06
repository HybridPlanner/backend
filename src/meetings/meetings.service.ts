import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { DatabaseService } from 'src/services/database/database.service';
import { Meeting } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MeetingsService {
  public constructor(
    private database: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  public async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    const meeting: Meeting = await this.database.meeting.create({
      data: {
        title: createMeetingDto.title,
        start_date: new Date(createMeetingDto.start_date),
        end_date: new Date(createMeetingDto.end_date),
      },
    });
    this.eventEmitter.emit('meeting.create', meeting);
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

  public findOne(id: number): Promise<Meeting> {
    return this.database.meeting.findUnique({
      where: {
        id,
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
        start_date: new Date(updateMeetingDto.start_date),
        end_date: new Date(updateMeetingDto.end_date),
      },
    });

    this.eventEmitter.emit('meeting.update', meeting);
    return meeting;
  }

  public async delete(id: number): Promise<Meeting> {
    const meeting: Meeting = await this.database.meeting.delete({
      where: {
        id,
      },
    });
    this.eventEmitter.emit('meeting.delete', meeting);
    return meeting;
  }
}
