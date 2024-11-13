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
      this.logger.error(
        `An Error Occurred while fetching user profile: ${error.message}`,
      );
      this.logger.error(`An Error Occurred: ${error.message}`);
      if (error instanceof HttpException) {
        throw new HttpException(error.getResponse(), error.getStatus());
      } else if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
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
}
