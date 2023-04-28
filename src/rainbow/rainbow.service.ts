import { Injectable, Logger } from '@nestjs/common';
import * as RainbowSDK from 'rainbow-node-sdk';

@Injectable()
export class RainbowService {
  public constructor() {
    const login = process.env.RAINBOW_LOGIN;
    const password = process.env.RAINBOW_PASSWORD;
    const appID = process.env.RAINBOW_APPLICATION_ID;
    const appSecret = process.env.RAINBOW_APPLICATION_SECRET;

    // Define your configuration
    const options = {
      rainbow: {
        host: 'sandbox',
        mode: 'xmpp',
      },
      credentials: {
        login,
        password,
      },
      // Application identifier
      application: {
        appID,
        appSecret,
      },
      // Logs options
      logs: {
        enableConsoleLogs: true,
        enableFileLogs: false,
        color: true,
        level: 'debug',
      },
      // IM options
      im: {
        sendReadReceipt: true,
        messageMaxLength: 1024, // the maximum size of IM messages sent. Note that this value must be under 1024.
        sendMessageToConnectedUser: false, // When it is setted to false it forbid to send message to the connected user. This avoid a bot to auto send messages.
        conversationsRetrievedFormat: 'small', // It allows to set the quantity of datas retrieved when SDK get conversations from server. Value can be "small" of "full"
        storeMessages: true, // Define a server side behaviour with the messages sent. When true, the messages are stored, else messages are only available on the fly. They can not be retrieved later.
        nbMaxConversations: 15, // parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are removed from XMPP server. They are not destroyed. The can be activated again with a send to the conversation again.
        rateLimitPerHour: 1000, // Set the maximum count of stanza messages of type `message` sent during one hour. The counter is started at startup, and reseted every hour.
        messagesDataStore: RainbowSDK.DataStoreType.StoreTwinSide, // Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour)<br>
        // DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
        // DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
        // DataStoreType.StoreTwinSide The messages are fully stored.<br>
        // DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.
      },
    };

    // Instantiate the SDK
    const rainbowSDK = new RainbowSDK(options);
    rainbowSDK.events.on('rainbow_onconnected', () => {
      Logger.log('Rainbow connected');
    });
    rainbowSDK.events.on('rainbow_onready', () => {
      Logger.log('Rainbow ready');
    });
    rainbowSDK.events.on('rainbow_onerror', (err) => {
      Logger.error('Rainbow error', err);
    });
    rainbowSDK.start().then(() => {
      console.log('Rainbow started.');
    });
  }
}
