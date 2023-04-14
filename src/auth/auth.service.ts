import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    // TODO: Add encryption to the password
    if (user?.password !== loginDto.password) {
      throw new UnauthorizedException();
    }

    // TODO: Generate a JWT and return it here
    // instead of the user object

    const payload = { email: user.email, id: user.id, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    // TODO: Add encryption to the password
    const user = await this.usersService.create(registerDto);

    const payload = { email: user.email, id: user.id, name: user.name };

    return payload;
  }
}
