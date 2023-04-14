import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  public constructor(private mailerService: MailerService) {}

  public async sendUserConfirmation(): Promise<void> {
    const url = `example.com/auth/confirm`;

    this.mailerService
      .sendMail({
        to: 'samymosa02@gmail.com',
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Hybrid Planner! Confirm your Email',
        template: 'confirmation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: 'John Doe',
          url,
        },
      })
      .then(() => {
        Logger.log(`Confirmation email sent`);
      })
      .catch((error) => {
        Logger.error(`Confirmation email failed`);
      });
  }
}
