import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { DatabaseService } from 'src/services/database/database.service';
import { IcsService } from 'src/ics/ics.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILHOG_HOST || 'mailhog',
        port: 1025,
        secure: false,
        debug: true,
        logger: true,
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService, DatabaseService, IcsService],
  exports: [MailService],
})
export class MailModule {}
