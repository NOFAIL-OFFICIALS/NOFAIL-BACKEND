import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import jwtConfig from 'src/iam/config/jwt.config';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    //
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Please Login to access this page');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
      });

      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException(
        'Authorization header not found. Please include an Authorization header with a Bearer token.',
      );
    }

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid authorization type. Expected Bearer token.',
      );
    }
    return type === 'Bearer' ? token : undefined;
  }
}
