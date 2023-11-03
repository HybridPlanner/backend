import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetingsService } from 'src/meetings/meetings.service';
import { RainbowService } from './rainbow/rainbow.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  public constructor(
    private readonly meetingsService: MeetingsService,
    private readonly rainbowService: RainbowService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  //   @Cron(CronExpression.EVERY_10_SECONDS)
  public async createBubbles(): Promise<void> {
    this.logger.debug('EVERY MINUTES');

    const inFifteenMinutes = new Date(Date.now() + 15 * 60 * 1000);
    const nextMeetings =
      await this.meetingsService.findAllUntilDate(inFifteenMinutes);

    const meetingsWithoutBubble = nextMeetings.filter(
      (meeting) => !meeting.bubbleId,
    );

    meetingsWithoutBubble.forEach(async (meeting) => {
      try {
        const bubble = await this.rainbowService.createBubble(
          meeting.title,
          meeting.description,
        );
        this.meetingsService.update(meeting.id, {
          bubbleId: bubble.id,
        });
        this.logger.debug(
          `Successfully created bubble ${bubble.id} for meeting ${meeting.id}`,
        );
      } catch (error) {
        this.logger.error(error);
      }
    });
  }
}
