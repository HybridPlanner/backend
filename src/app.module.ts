import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './services/database/database.service';
import { MeetingsModule } from './meetings/meetings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [MeetingsModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule {}
