import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as RainbowSDK from 'rainbow-node-sdk';
import { EnvConfig } from '../../config';

@Injectable()
export class RainbowService implements OnApplicationShutdown {
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
  }

  public onApplicationShutdown(): void {
    this.rainbowSDK.stop();
  }
}
