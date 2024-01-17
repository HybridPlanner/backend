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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplicationEvent } from 'src/types/MeetingEvents';

/**
 * Controller for managing meetings.
 */
@Controller('meetings')
export class MeetingsController {
  private readonly logger = new Logger(MeetingsController.name);

  public constructor(
    private readonly meetingsService: MeetingsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new meeting.
   * @param createMeetingDto - The data for creating the meeting.
   * @returns A promise that resolves to the created meeting.
   */
  @Post()
  public create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingsService.create(createMeetingDto);
  }

  /**
   * Find all meetings.
   * @param previous - Optional. The timestamp of the previous meeting to retrieve meetings before.
   * @returns A promise that resolves to an object containing the list of meetings.
   * @throws BadRequestException if the previous date is not valid or in the future.
   */
  @Get()
  public async findAll(
    @Query('before') previous?: string,
  ): Promise<{ meetings: Meeting[] }> {
    if (!previous) {
      const meetings = await this.meetingsService.findAll();
      return { meetings };
    }

    const previousDate = new Date(previous);

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

  /**
   * Find attendees of a meeting by email.
   * @param email - The email of the attendees to search for.
   * @returns A promise that resolves to an array of attendees.
   */
  @Get('attendees')
  public findAttendees(@Query('email') email: string): Promise<Attendee[]> {
    return this.meetingsService.findAttendees(email);
  }

  /**
   * Find a meeting by ID.
   * @param id - The ID of the meeting to retrieve.
   * @returns A promise that resolves to the meeting with attendees.
   * @throws NotFoundException if the meeting is not found.
   */
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

  /**
   * Update a meeting by ID.
   * @param id - The ID of the meeting to update.
   * @param updateMeetingDto - The data for updating the meeting.
   * @returns A promise that resolves to the updated meeting.
   * @note Emits a MEETING_MANUAL_UPDATE event.
   */
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    const meeting = await this.meetingsService.update(+id, updateMeetingDto);
    this.eventEmitter.emit(ApplicationEvent.MEETING_MANUAL_UPDATE, meeting);
    return meeting;
  }

  /**
   * Delete a meeting by ID.
   * @param id - The ID of the meeting to delete.
   * @returns A promise that resolves to the deleted meeting.
   */
  @Delete(':id')
  public delete(@Param('id', ParseIntPipe) id: number): Promise<Meeting> {
    return this.meetingsService.delete(id);
  }

  /**
   * Subscribe to server-sent events for a meeting.
   * @param id - The ID of the meeting to subscribe to events for.
   * @returns An observable that emits message events for the specified meeting.
   */
  @Sse(':id/events')
  public sse(@Param('id', ParseIntPipe) id: number): Observable<MessageEvent> {
    return this.meetingsService.meetings.pipe(
      filter((event) => event.id === +id),
      map((event) => ({ data: event })),
    );
  }
}
