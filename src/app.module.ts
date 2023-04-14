import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MeetingScheduleService } from './meeting-schedule/meeting-schedule.service';

@Module({
  imports: [MailModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [DatabaseService, MeetingScheduleService],
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
