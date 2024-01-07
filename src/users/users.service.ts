/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service responsible for managing user data.
 */
@Injectable()
export class UsersService {
  public constructor(
    private database: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) { }
  
  /**
   * Creates a new user with the provided data.
   * @param data - The data for creating the user.
   * @returns A promise that resolves to the created user.
   */
  public async create(data: CreateUserDto): Promise<User> {
    const user: User = await this.database.user.create({
      data,
    });
    this.eventEmitter.emit('user.create', user.email);
    return user;
  }

  /**
   * Finds a user by their ID.
   * @param id - The ID of the user to find.
   * @returns A promise that resolves to the found user, or undefined if not found.
   */
  public async findOneById(id: number): Promise<User | undefined> {
    return this.database.user.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Finds a user by their email.
   * @param email - The email of the user to find.
   * @returns A promise that resolves to the found user, or undefined if not found.
   */
  public async findOneByEmail(email: string): Promise<User | undefined> {
    return this.database.user.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Finds multiple users by their name.
   * @param name - The name of the users to find.
   * @returns A promise that resolves to an array of found users, or undefined if not found.
   */
  public async findManyByName(name: string): Promise<User[] | undefined> {
    return this.database.user.findMany({
      where: {
        name,
      },
    });
  }
}
