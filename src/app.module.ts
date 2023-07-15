import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MeetingsModule } from './meetings/meetings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MeetingScheduleService } from './meeting-schedule/meeting-schedule.service';

@Module({
  imports: [
    MeetingsModule,
    AuthModule,
    UsersModule,
    MailModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    MeetingScheduleService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  public constructor(
    private mailService: MailService,
    private meetingScheduleService: MeetingScheduleService,
  ) {
    const inOneMinute = new Date(Date.now() + 60 * 1000);
    this.meetingScheduleService.scheduleMail(
      inOneMinute,
      'hello.world@gmail.com',
    );
  }
}
