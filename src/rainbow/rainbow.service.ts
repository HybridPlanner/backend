import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as RainbowSDK from 'rainbow-node-sdk';
import { type BubblesService } from 'rainbow-node-sdk/lib/services/BubblesService';
import { Bubble } from 'rainbow-node-sdk/lib/common/models/Bubble';
import { EnvConfig } from '../config';
import { Contact } from 'rainbow-node-sdk/lib/common/models/Contact';

@Injectable()
export class RainbowService implements OnApplicationShutdown {
  private readonly logger = new Logger(RainbowService.name);
  private rainbowSDK: RainbowSDK;

  public constructor(private config: ConfigService<EnvConfig>) {
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

      /*const BUBBLE_NAME = 'Demo';
      const BUBBLE_DESCRIPTION = 'Demo bubble';

      let bubble = this.getBubble(BUBBLE_NAME);
      if (!bubble) {
        Logger.log(`"${BUBBLE_NAME}" not found, creating...`);
        bubble = await this.createBubble(BUBBLE_NAME, BUBBLE_DESCRIPTION);
        Logger.log(`"${BUBBLE_NAME}" created`);
      } else {
        Logger.log(`"${BUBBLE_NAME}" found`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Start a conference
      Logger.log(`Calling "${BUBBLE_NAME}"...`);
      await this.callBubble(bubble);

      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Hangup conference
      Logger.log(`Hanging up "${BUBBLE_NAME}"...`);
      await this.hangupBubble(bubble);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Delete bubble
      Logger.log(`Deleting "${BUBBLE_NAME}"...`);
      await this.deleteBubble(bubble);
      Logger.log(`"${BUBBLE_NAME}" deleted`);*/
    });
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.rainbowSDK.stop();
  }

  public async createBubble(
    name: string,
    description: string,
  ): Promise<Bubble> {
    const bubble = (await (
      this.rainbowSDK.bubbles as BubblesService
    ).createBubble(name, description, false)) as Bubble;

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
