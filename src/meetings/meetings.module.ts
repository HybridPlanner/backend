import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, DatabaseService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
