import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthType } from '../../enum/auth.type.enum';
import { AUTH_TYPE_KEY } from '../../decorators/Auth.decorator';
import jwtConfig from 'src/iam/config/jwt.config';
import { AccessTokenGuard } from '../access_token/guard.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;
  private logger = new Logger(AuthenticationGuard.name);
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
  };
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    //
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authType = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getClass(), context.getHandler()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    // Auth type is a number which essentially relates to the auth authTypeGuardMap

    const guards = authType.map((type) => this.authTypeGuardMap[type]).flat();
    // The guard then fetches the appropraite function, in our this is, access guard

    for (const instance of guards) {
      //
      try {
        const canActivate = await Promise.resolve(
          instance.canActivate(context),
        );
        if (canActivate) {
          return true;
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        } else {
          this.logger.error('Error during authentication:', error.message);
        }
      }
    }
  }
}
