/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/services/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  public constructor(
    private database: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}
  
  public async create(data: CreateUserDto): Promise<User> {
    const user: User = await this.database.user.create({
      data,
    });
    this.eventEmitter.emit('user.create', user.email);
    return user;
  }

  public async findOneById(id: number): Promise<User | undefined> {
    return this.database.user.findUnique({
      where: {
        id,
      },
    });
  }

  public async findOneByEmail(email: string): Promise<User | undefined> {
    return this.database.user.findUnique({
      where: {
        email,
      },
    });
  }

  public async findManyByName(name: string): Promise<User[] | undefined> {
    return this.database.user.findMany({
      where: {
        name,
      },
    });
  }
}
