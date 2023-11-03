import { Injectable, Logger } from '@nestjs/common';
import { MeetingsService } from '../meetings.service';
import { RainbowService } from 'src/services/rainbow/rainbow.service';

@Injectable()
export class MeetingTasksService {
  private readonly logger = new Logger(MeetingTasksService.name);

  public constructor(
    private readonly meetingsService: MeetingsService,
    private readonly rainbowService: RainbowService,
  ) {}

  public async createBubbles(): Promise<void> {
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
        await this.meetingsService.update(meeting.id, {
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
