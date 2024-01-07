import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Database service class that extends PrismaClient and implements OnModuleInit.
 * Connects to the database on module initialization.
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
