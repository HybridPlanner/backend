import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetingTasksService } from 'src/meetings/tasks/meeting.tasks.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  public constructor(
    private readonly meetingsTasksService: MeetingTasksService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async everyMinutes(): Promise<void> {
    this.meetingsTasksService.createBubbles();
  }
}
