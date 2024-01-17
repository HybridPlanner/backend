import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as RainbowSDK from 'rainbow-node-sdk';
import { type BubblesService } from 'rainbow-node-sdk/lib/services/BubblesService';
import { Bubble } from 'rainbow-node-sdk/lib/common/models/Bubble';
import { EnvConfig } from '../config';
import { Contact } from 'rainbow-node-sdk/lib/common/models/Contact';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplicationEvent } from 'src/types/MeetingEvents';
import { ConversationsService } from 'rainbow-node-sdk/lib/services/ConversationsService';
import { ImsService } from 'rainbow-node-sdk/lib/services/ImsService';
import { Message } from 'rainbow-node-sdk/lib/common/models/Message';

/**
 * Service class for interacting with the RainbowSDK.
 * Implements the OnApplicationShutdown interface to handle application shutdown events.
 */
@Injectable()
export class RainbowService implements OnApplicationShutdown {
  private readonly logger = new Logger(RainbowService.name);
  private rainbowSDK: RainbowSDK;

  /**
   * Constructs a new instance of the RainbowService class.
   * @param config - The configuration service for environment variables.
   * @param eventEmitter - The event emitter for handling application events.
   */
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
        this.eventEmitter.emit(ApplicationEvent.CONFERENCE_STOPPED, bubble);
      },
    );

    this.rainbowSDK.events.on(
      'rainbow_onbubbleconferencestartedreceived',
      (bubble: Bubble) => {
        this.eventEmitter.emit(ApplicationEvent.CONFERENCE_STARTED, bubble);
      },
    );
  }

  /**
   * Handles the application shutdown event.
   * @returns A promise that resolves when the shutdown process is complete.
   */
  public async onApplicationShutdown(): Promise<void> {
    await this.rainbowSDK.stop();
  }

  /**
   * Creates a new bubble with the given name.
   * @param name - The name of the bubble.
   * @returns A Promise that resolves to the created Bubble object.
   */
  public async createBubble(name: string): Promise<Bubble> {
    const bubble = (await (
      this.rainbowSDK.bubbles as BubblesService
    ).createBubble(name, 'Generated with Hybrid Planner', false)) as Bubble;

    return bubble;
  }

  /**
   * Updates the bubble with the specified ID and name.
   * @param bubbleId The ID of the bubble to update.
   * @param name The new name for the bubble.
   * @returns A Promise that resolves to the updated Bubble object.
   */
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

  /**
   * Retrieves a bubble by its name.
   * @param name - The name of the bubble.
   * @returns The bubble with the specified name, or undefined if not found.
   */
  public getBubbleByName(name: string): Bubble {
    const bubbles = (
      this.rainbowSDK.bubbles as BubblesService
    ).getAllOwnedBubbles();
    const bubble = bubbles.find((b) => b.name === name);

    return bubble;
  }

  /**
   * Retrieves a bubble by its ID.
   * @param id The ID of the bubble to retrieve.
   * @returns The bubble with the specified ID, or undefined if not found.
   */
  public getBubbleByID(id: string): Bubble {
    const bubbles = (
      this.rainbowSDK.bubbles as BubblesService
    ).getAllOwnedBubbles();
    const bubble = bubbles.find((b) => b.id === id);

    return bubble;
  }

  /**
   * Deletes a bubble.
   * @param bubble - The bubble to be deleted.
   * @returns A promise that resolves when the bubble is deleted.
   */
  public async deleteBubble(bubble: Bubble): Promise<void> {
    await (this.rainbowSDK.bubbles as BubblesService).deleteBubble(bubble);
  }

  /**
   * Adds a Rainbow user to a bubble.
   * @param bubble - The bubble to add the user to.
   * @param user - The user to be added to the bubble.
   * @param inviteReason - The reason for inviting the user to the bubble.
   * @returns A Promise that resolves when the user has been added to the bubble.
   */
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

  /**
   * Removes a Rainbow user from a bubble.
   * @param bubble - The bubble from which the user will be removed.
   * @param user - The user to be removed from the bubble.
   * @returns A Promise that resolves when the user has been removed from the bubble.
   */
  public async removeRainbowUserFromBubble(
    bubble: Bubble,
    user: Contact,
  ): Promise<void> {
    await (this.rainbowSDK.bubbles as BubblesService).removeContactFromBubble(
      bubble,
      user,
    );
  }

  /**
   * Calls the bubble and starts a conference or webinar in a room.
   * @param bubble - The bubble to call.
   * @returns A promise that resolves with the conference object.
   */
  public async callBubble(bubble: Bubble): Promise<unknown> {
    const conference = await (
      this.rainbowSDK.bubbles as BubblesService
    ).startConferenceOrWebinarInARoom(bubble.id);

    return conference;
  }

  /**
   * Checks if there is any user in the bubble's conference.
   * @param bubble - The bubble to check.
   * @returns A promise that resolves with a boolean indicating whether there are users in the bubble's conference.
   * @remarks This method is used to check if the bubble's conference is empty before hanging up the bubble.
   */
  public async isBubbleConferenceEmpty(bubble: Bubble): Promise<boolean> {
    const conference = (await (
      this.rainbowSDK.bubbles as BubblesService
    ).snapshotConference(bubble.id)) as {
      _participants: { list: unknown[] };
    };

    return conference?._participants?.list?.length === 0;
  }

  /**
   * Hangs up a bubble by stopping the conference or webinar associated with it.
   * @param bubble - The bubble to hang up.
   * @returns A promise that resolves with the conference object.
   */
  public async hangupBubble(bubble: Bubble): Promise<unknown> {
    const conference = await (
      this.rainbowSDK.bubbles as BubblesService
    ).stopConferenceOrWebinar(bubble.id);

    return conference;
  }

  /**
   * Retrieves the public URL for a given bubble.
   * @param bubble - The bubble for which to retrieve the public URL.
   * @returns A Promise that resolves to the public URL of the bubble.
   */
  public async getBubblePublicUrl(bubble: Bubble): Promise<string> {
    const url = await (
      this.rainbowSDK.bubbles as BubblesService
    ).createPublicUrl(bubble);

    return url;
  }

  /**
   * Retrieves the history of messages for a given bubble.
   * @param bubbleId - The ID of the bubble for which to retrieve the message history.
   * @returns A Promise that resolves to an array of Message objects.
   */
  public async getMessagesFromBubbleId(bubbleId: string): Promise<Message[]> {
    const conversationService = this.rainbowSDK
      .conversations as ConversationsService;
    const imService = this.rainbowSDK.im as ImsService;

    const conversation =
      await conversationService.getConversationByBubbleId(bubbleId);

    try {
      const conversationMessages =
        await imService.getMessagesFromConversation(conversation);
      return conversationMessages._messages as Message[];
    } catch (e) {
      this.logger.error(e);
      return [];
    }
  }
}
