import { Injectable } from '@nestjs/common';
import * as RainbowSDK from 'rainbow-node-sdk';

@Injectable()
export class RainbowService {
  private rainbowSDK: RainbowSDK;
  private options = {
    rainbow: {
      host: 'sandbox',
    },
    credentials: {
      login: process.env.RAINBOW_LOGIN,
      password: process.env.RAINBOW_PASSWORD,
    },
    application: {
      appID: process.env.RAINBOW_APPLICATION_ID,
      appSecret: process.env.RAINBOW_APPLICATION_SECRET,
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
  };

  public constructor() {
    this.rainbowSDK = new RainbowSDK(this.options);
    this.rainbowSDK.start();
  }
}
