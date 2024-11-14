import {
  Body,
  ConflictException,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Request } from 'express';
import { Auth } from './decorators/Auth.decorator';
import { AuthType } from './enum/auth.type.enum';
import { LoginDto } from 'src/users/dto/loginDto.dto';
@Auth(AuthType.None)
@Controller('user')
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name);
  constructor(private readonly authService: AuthenticationService) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Req() req: Request) {
    try {
      const req = await this.authService.createUser(body);
      return req;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      // Since we're already throwing specific exceptions in the service,
      // we can just rethrow them here
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    try {
      return await this.authService.login(body);
    } catch (error) {
      this.logger.error(`Failed to login: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while logging in. Try again later',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
