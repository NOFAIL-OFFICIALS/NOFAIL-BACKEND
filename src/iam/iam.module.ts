import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { User, userSchema } from 'src/users/entities/user.entity';
import { AccessTokenGuard } from './authentication/guard/access_token/guard.guard';
import { AuthenticationGuard } from './authentication/guard/auth_guard/auth_guard.guard';
import { APP_GUARD } from '@nestjs/core';
import { HashingService } from './hashing/hashing.abstract';
import { BcryptService } from './hashing/bcrypt.hash';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],

  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,

    AccessTokenGuard,
    BcryptService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
  exports: [AccessTokenGuard, AuthenticationService],
})
export class IamModule {}
