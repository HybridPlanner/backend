import {
  CanActivate,
  CustomDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);

/**
 * A guard that implements the CanActivate interface to protect routes based on authentication.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Creates an instance of AuthGuard.
   * @param jwtService - The JwtService instance for JWT operations.
   * @param reflector - The Reflector instance for metadata reflection.
   */
  public constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  /**
   * Determines if the route can be activated based on authentication.
   * @param context - The execution context of the route.
   * @returns A promise that resolves to a boolean indicating if the route can be activated.
   * @throws UnauthorizedException if the route is not public and the user is not authenticated.
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  /**
   * Extracts the JWT token from the request header.
   * @param request - The HTTP request object.
   * @returns The JWT token if found, otherwise undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
