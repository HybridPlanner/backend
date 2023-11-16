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
} from '@nestjs/common';
import { MeetingEvent, MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Attendee, Meeting } from '@prisma/client';
import { isAfter, isValid } from 'date-fns';
import { MeetingWithAttendees } from './meetings.type';
import { Observable, filter } from 'rxjs';

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

  @Get('/attendees?')
  public findAttendees(@Query('email') email: string): Promise<Attendee[]> {
    return this.meetingsService.findAttendees(email);
  }

  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<MeetingWithAttendees> {
    const meeting = await this.meetingsService.findOneWithAttendees(+id);

    console.log(meeting);
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
  public delete(@Param('id') id: string): Promise<Meeting> {
    return this.meetingsService.delete(+id);
  }

  @Sse('/sse/:id')
  public sse(@Param('id') id: string): Observable<MeetingEvent> {
    return this.meetingsService.meetings.pipe(
      filter((event) => event.id === +id),
    );
  }
}
