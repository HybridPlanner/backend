import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';
import { Public } from './auth.guard';

/**
 * Controller responsible for handling authentication-related requests.
 */
@Controller('auth')
export class AuthController {
  public constructor(private authService: AuthService) {}

  /**
   * Endpoint for user login.
   * @param loginDto - The login data provided by the user.
   * @returns A promise that resolves to an object containing the access token and user information.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint for user registration.
   * @param registerDto - The registration data provided by the user.
   * @returns A promise that resolves to an object containing the user information.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  public register(@Body() registerDto: RegisterDto): Promise<Partial<User>> {
    return this.authService.register(registerDto);
  }
}
