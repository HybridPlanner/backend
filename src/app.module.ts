import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MeetingsModule } from './meetings/meetings.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
//import { AuthGuard } from './auth/auth.guard';
//import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MeetingScheduleService } from './meeting-schedule/meeting-schedule.service';
import { RainbowService } from './services/rainbow/rainbow.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MeetingsModule,
    // Disabled for now, authentication should be added later as a bonus
    // AuthModule,
    UsersModule,
    MailModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    MeetingScheduleService,
    RainbowService,
    /*{
      provide: APP_GUARD,
      useClass: AuthGuard,
    },*/
  ],
})
export class AppModule {
  public constructor(
    private mailService: MailService,
    private meetingScheduleService: MeetingScheduleService,
    private rainbowService: RainbowService,
  ) {
    // const inOneMinute = new Date(Date.now() + 60 * 1000);
    // this.meetingScheduleService.scheduleMail(
    //   inOneMinute,
    //   'hello.world@gmail.com',
    // );
  }
}
