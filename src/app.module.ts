import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './database/database.service';
import { MeetingsModule } from './meetings/meetings.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler/scheduler.service';
import { RainbowService } from './rainbow/rainbow.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RainbowModule } from './rainbow/rainbow.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    MeetingsModule,
    UsersModule,
    MailModule,
    ScheduleModule.forRoot(),
    RainbowModule,
  ],
  controllers: [AppController],
  providers: [DatabaseService, SchedulerService, RainbowService],
})
export class AppModule {
  public constructor(
    private mailService: MailService,
    private schedulerService: SchedulerService,
    private rainbowService: RainbowService,
  ) {}
}
