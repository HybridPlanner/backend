import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MeetingScheduleService } from './meeting-schedule/meeting-schedule.service';
import { RainbowService } from './rainbow/rainbow.service';

@Module({
  imports: [MailModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [DatabaseService, MeetingScheduleService, RainbowService],
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
