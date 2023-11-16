import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { DatabaseService } from 'src/services/database/database.service';
import { RainbowModule } from 'src/rainbow/rainbow.module';

@Module({
  imports: [RainbowModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, DatabaseService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
