import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MeetingsModule } from './meetings/meetings.module';

@Module({
  imports: [MeetingsModule],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule {}
