import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(loginDto: LoginDto): Promise<Partial<User>> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    // TODO: Add encryption to the password
    if (user?.password !== loginDto.password) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    // TODO: Add encryption to the password
    const user = await this.usersService.create(registerDto);

    const { password, ...result } = user;

    return result;
  }
}
