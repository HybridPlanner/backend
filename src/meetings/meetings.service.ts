import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { DatabaseService } from 'src/services/database/database.service';
import { Meeting } from '@prisma/client';

@Injectable()
export class MeetingsService {
  public constructor(private database: DatabaseService) {}

  public create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.database.meeting.create({
      data: createMeetingDto,
    });
  }

  public findAll(limit?: number): Promise<Meeting[]> {
    return this.database.meeting.findMany({
      take: limit,
    });
  }

  public findAllPrevious(previous: Date, limit?: number): Promise<Meeting[]> {
    return this.database.meeting.findMany({
      take: limit,
      where: {
        start_date: {
          lte: previous,
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

  public update(
    id: number,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    return this.database.meeting.update({
      where: {
        id,
      },
      data: updateMeetingDto,
    });
  }

  public remove(id: number): Promise<Meeting> {
    return this.database.meeting.delete({
      where: {
        id,
      },
    });
  }
}
