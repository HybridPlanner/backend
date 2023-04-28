import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Meeting } from '@prisma/client';

@Controller('meetings')
export class MeetingsController {
  public constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  public create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  public findAll(): Promise<Meeting[]> {
    return this.meetingsService.findAll();
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
  public remove(@Param('id') id: string): Promise<Meeting> {
    return this.meetingsService.remove(+id);
  }
}
