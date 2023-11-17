import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as RainbowSDK from 'rainbow-node-sdk';
import { type BubblesService } from 'rainbow-node-sdk/lib/services/BubblesService';
import { Bubble } from 'rainbow-node-sdk/lib/common/models/Bubble';
import { EnvConfig } from '../config';
import { Contact } from 'rainbow-node-sdk/lib/common/models/Contact';
import { Observable, Subject } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplicationEvent } from 'src/types/MeetingEvents';

@Injectable()
export class RainbowService implements OnApplicationShutdown {
  private readonly logger = new Logger(RainbowService.name);
  private rainbowSDK: RainbowSDK;

  public constructor(
    private config: ConfigService<EnvConfig>,
    private eventEmitter: EventEmitter2,
  ) {
    this.rainbowSDK = new RainbowSDK({
      rainbow: {
        host: this.config.get<string>('RAINBOW_HOST'),
      },
      credentials: {
        login: this.config.get<string>('RAINBOW_LOGIN'),
        password: this.config.get<string>('RAINBOW_PASSWORD'),
      },
      application: {
        appID: this.config.get<string>('RAINBOW_APPLICATION_ID'),
        appSecret: this.config.get<string>('RAINBOW_APPLICATION_SECRET'),
      },
      logs: {
        enableConsoleLogs: true,
        enableFileLogs: false,
        color: true,
        level: 'error',
      },
      im: {
        sendReadReceipt: true,
        messageMaxLength: 1024,
        sendMessageToConnectedUser: false,
        conversationsRetrievedFormat: 'small',
        storeMessages: true,
        nbMaxConversations: 15,
        rateLimitPerHour: 1000,
        messagesDataStore: RainbowSDK.DataStoreType.StoreTwinSide,
      },
    });

    this.rainbowSDK.start();

    this.rainbowSDK.events.on('rainbow_onready', async () => {
      Logger.log('Rainbow SDK started');
    });

    this.rainbowSDK.events.on(
      'rainbow_onbubbleconferencestoppedreceived',
      (bubble: Bubble) => {
        this.eventEmitter.emit(ApplicationEvent.MEETING_END, bubble);
      },
    );

    this.rainbowSDK.events.on(
      'rainbow_onbubbleconferencestartedreceived',
      (bubble: Bubble) => {
        this.eventEmitter.emit(ApplicationEvent.MEETING_CANCEL_END, bubble);
      },
    );
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.rainbowSDK.stop();
  }

  public async createBubble(name: string): Promise<Bubble> {
    const bubble = (await (
      this.rainbowSDK.bubbles as BubblesService
    ).createBubble(name, 'Generated with Hybrid Planner', false)) as Bubble;

    return bubble;
  }

  public async updateBubble(bubbleId: string, name: string): Promise<Bubble> {
    const bubble = (await (
      this.rainbowSDK.bubbles as BubblesService
    ).updateBubbleData(
      bubbleId,
      undefined,
      'Generated with Hybrid Planner',
      name,
    )) as Bubble;

    return bubble;
  }

  public getBubbleByName(name: string): Bubble {
    const bubbles = (
      this.rainbowSDK.bubbles as BubblesService
    ).getAllOwnedBubbles();
    const bubble = bubbles.find((b) => b.name === name);

    return bubble;
  }

  public getBubbleByID(id: string): Bubble {
    const bubbles = (
      this.rainbowSDK.bubbles as BubblesService
    ).getAllOwnedBubbles();
    const bubble = bubbles.find((b) => b.id === id);

    return bubble;
  }

  public async deleteBubble(bubble: Bubble): Promise<void> {
    await (this.rainbowSDK.bubbles as BubblesService).deleteBubble(bubble);
  }

  public async addRainbowUserToBubble(
    bubble: Bubble,
    user: Contact,
    inviteReason: string,
  ): Promise<void> {
    await (this.rainbowSDK.bubbles as BubblesService).inviteContactToBubble(
      bubble,
      user,
      false,
      false,
      inviteReason,
    );
  }

  public async removeRainbowUserFromBubble(
    bubble: Bubble,
    user: Contact,
  ): Promise<void> {
    await (this.rainbowSDK.bubbles as BubblesService).removeContactFromBubble(
      bubble,
      user,
    );
  }

  public async callBubble(bubble: Bubble): Promise<unknown> {
    const conference = await (
      this.rainbowSDK.bubbles as BubblesService
    ).startConferenceOrWebinarInARoom(bubble.id);

    return conference;
  }

  public async hangupBubble(bubble: Bubble): Promise<unknown> {
    const conference = await (
      this.rainbowSDK.bubbles as BubblesService
    ).stopConferenceOrWebinar(bubble.id);

    return conference;
  }

  public async getBubblePublicUrl(bubble: Bubble): Promise<string> {
    const url = await (
      this.rainbowSDK.bubbles as BubblesService
    ).createPublicUrl(bubble);

    return url;
  }
}
