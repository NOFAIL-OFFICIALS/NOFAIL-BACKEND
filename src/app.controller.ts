import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthType } from './iam/authentication/enum/auth.type.enum';
import { Auth } from './iam/authentication/decorators/Auth.decorator';

@Controller()
@Auth(AuthType.None)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
