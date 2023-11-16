import { Module } from '@nestjs/common';
import { RainbowService } from './rainbow.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config';
import { DatabaseService } from 'src/services/database/database.service';

@Module({
  imports: [],
  providers: [RainbowService, ConfigService<EnvConfig>, DatabaseService],
  exports: [RainbowService],
})
export class RainbowModule {}
