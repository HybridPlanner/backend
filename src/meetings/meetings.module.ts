import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { DatabaseService } from 'src/services/database/database.service';
import { MeetingTasksService } from './tasks/meeting.tasks.service';
import { RainbowService } from 'src/services/rainbow/rainbow.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    DatabaseService,
    RainbowService,
    MeetingTasksService,
  ],
  exports: [MeetingsService, MeetingTasksService],
  imports: [MeetingsModule, ConfigModule],
})
export class MeetingsModule {}
