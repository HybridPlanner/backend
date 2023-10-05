/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/services/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  public constructor(private database: DatabaseService) {}

  public async create(data: CreateUserDto): Promise<User> {
    return this.database.user.create({
      data,
    });
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