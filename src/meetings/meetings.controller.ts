import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  Logger,
  Sse,
  NotFoundException,
  ParseIntPipe,
  MessageEvent,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Attendee, Meeting } from '@prisma/client';
import { isAfter, isValid } from 'date-fns';
import { MeetingWithAttendees } from './meetings.type';
import { Observable, filter, map } from 'rxjs';

@Controller('meetings')
export class MeetingsController {
  private readonly logger = new Logger(MeetingsController.name);

  public constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  public create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  public async findAll(
    @Query('before') previous?: number,
  ): Promise<{ meetings: Meeting[] }> {
    if (!previous) {
      const meetings = await this.meetingsService.findAll();
      return { meetings };
    }

    const previousDate = new Date(previous * 1000);

    if (!isValid(previousDate)) {
      throw new BadRequestException(
        'Previous date is not valid, expected timestamp',
      );
    }

    if (isAfter(previousDate, new Date())) {
      throw new BadRequestException('Previous date must be in the past');
    }

    this.logger.debug(`Finding meetings before ${previousDate.toISOString()}`);

    const meetings = await this.meetingsService.findAllPrevious(previousDate);
    return { meetings };
  }

  @Get('attendees')
  public findAttendees(@Query('email') email: string): Promise<Attendee[]> {
    return this.meetingsService.findAttendees(email);
  }

  @Get(':id')
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MeetingWithAttendees> {
    const meeting = await this.meetingsService.findOneWithAttendees(+id);

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  @Patch(':id')
  public update(
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    return this.meetingsService.update(+id, updateMeetingDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseIntPipe) id: number): Promise<Meeting> {
    return this.meetingsService.delete(id);
  }

  @Sse(':id/events')
  public sse(@Param('id', ParseIntPipe) id: number): Observable<MessageEvent> {
    return this.meetingsService.meetings.pipe(
      filter((event) => event.id === +id),
      map((event) => {
        let data: string | object;

        switch (event.type) {
          case 'bubbleCreated':
            data = event.meeting;
            break;
          case 'started':
            data = event.url;
            break;
          case 'updated':
            data = event.meeting;
            break;
          default:
        }

        return {
          type: event.type,
          data,
        } satisfies MessageEvent;
      }),
    );
  }
}
