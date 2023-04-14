import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [MailModule],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule {
  // send email
  public constructor(private mailService: MailService) {
    this.mailService.sendUserConfirmation();
  }
}
