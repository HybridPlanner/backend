import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database.service';
import { MeetingsModule } from './meetings/meetings.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
//import { AuthGuard } from './auth/auth.guard';
//import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './services/scheduler.service';
import { RainbowService } from './rainbow/rainbow.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RainbowModule } from './rainbow/rainbow.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    MeetingsModule,
    // Disabled for now, authentication should be added later as a bonus
    // AuthModule,
    UsersModule,
    MailModule,
    ScheduleModule.forRoot(),
    RainbowModule,
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    SchedulerService,
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
    private schedulerService: SchedulerService,
    private rainbowService: RainbowService,
  ) {
    // const inOneMinute = new Date(Date.now() + 60 * 1000);
    // this.schedulerService.scheduleMail(
    //   inOneMinute,
    //   'hello.world@gmail.com',
    // );
  }
}
