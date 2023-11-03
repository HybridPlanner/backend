import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetingsService } from 'src/meetings/meetings.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  public constructor(private readonly meetingsService: MeetingsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async createBubbles(): Promise<void> {
    this.logger.debug('EVERY 10 SECONDES');

    const inFifteenMinutes = new Date(Date.now() + 15 * 60 * 1000);
    const nextMeetings =
      await this.meetingsService.findAllUntilDate(inFifteenMinutes);

    const meetingsWithoutBubble = nextMeetings.filter(
      (meeting) => !meeting.bubbleId,
    );

    console.log(meetingsWithoutBubble);
  }
}
