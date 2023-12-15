import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { DatabaseService } from 'src/database/database.service';
import { RainbowModule } from 'src/rainbow/rainbow.module';

/**
 * Represents the module for managing meetings.
 */
@Module({
  imports: [RainbowModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, DatabaseService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
