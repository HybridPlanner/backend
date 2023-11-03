import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class SchedulerService {
  public constructor(
    private mailService: MailService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  public scheduleMail(time: Date, to: string): void {
    const job = new CronJob(time, () => {
      this.mailService.sendUserConfirmation(to);
      Logger.log(`Mail sent to ${to}`);
    });
    this.schedulerRegistry.addCronJob(`mail-${to}-${time}`, job);
    job.start();
  }

  public test(time: Date): void {
    const job = new CronJob(time, () => {
      Logger.log(`Test`);
    });
    this.schedulerRegistry.addCronJob(`test-${time}`, job);
    job.start();
  }
}
