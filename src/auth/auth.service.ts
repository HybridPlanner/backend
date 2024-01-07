import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/**
 * Service responsible for handling authentication-related operations.
 */
@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService.
   * @param usersService - The UsersService instance.
   * @param jwtService - The JwtService instance.
   */
  public constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Logs in a user with the provided credentials.
   * @param loginDto - The login data transfer object.
   * @returns A promise that resolves to an object containing the access token and user information.
   * @throws UnauthorizedException if the provided password is invalid.
   */
  public async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, id: user.id, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  /**
   * Registers a new user with the provided information.
   * @param registerDto - The register data transfer object.
   * @returns A promise that resolves to an object containing the user information.
   */
  public async register(registerDto: RegisterDto): Promise<Partial<User>> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { email: user.email, id: user.id, name: user.name };

    return payload;
  }
}
