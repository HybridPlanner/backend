/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/services/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.database.user.create({
      data,
    });
  }

  async findOneById(id: number): Promise<User | undefined> {
    return this.database.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.database.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findManyByName(name: string): Promise<User[] | undefined> {
    return this.database.user.findMany({
      where: {
        name,
      },
    });
  }
}
