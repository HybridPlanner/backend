import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { IcsService } from 'src/ics/ics.service';
import { MeetingsModule } from 'src/meetings/meetings.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config';

/**
 * Module for handling email functionality.
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService<EnvConfig>],
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvConfig>) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: false,
          debug: true,
          logger: true,

          // Add auth only if user and pass are defined
          ...(config.get<string>('MAIL_USER') &&
            config.get<string>('MAIL_PASS') && {
              auth: {
                user: config.get<string>('MAIL_USER'),
                pass: config.get<string>('MAIL_PASS'),
              },
            }),
        },
        defaults: {
          from: config.get<string>('MAIL_DEFAULT_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    MeetingsModule,
  ],
  providers: [MailService, IcsService],
  exports: [MailService],
})
export class MailModule {}
