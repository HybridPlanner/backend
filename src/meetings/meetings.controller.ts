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
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Meeting } from '@prisma/client';
import { isBefore } from 'date-fns';

@Controller('meetings')
export class MeetingsController {
  public constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  public create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  public async findAll(
    @Query('previous') previous?: number,
  ): Promise<{ meetings: Meeting[] }> {
    if (!previous) {
      const meetings = await this.meetingsService.findAll();
      return { meetings };
    }

    const previousDate = new Date(previous);
    if (!isBefore(previousDate, new Date())) {
      throw new BadRequestException('Previous date must be in the past');
    }

    const meetings = await this.meetingsService.findAllPrevious(previousDate);
    return { meetings };
  }

  @Get(':id')
  public findOne(@Param('id') id: string): Promise<Meeting> {
    return this.meetingsService.findOne(+id);
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
}
