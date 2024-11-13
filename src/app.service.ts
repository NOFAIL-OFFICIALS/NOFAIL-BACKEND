import { Injectable } from '@nestjs/common';
import { Auth } from './iam/authentication/decorators/Auth.decorator';
import { AuthType } from './iam/authentication/enum/auth.type.enum';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! from Nest!!!';
  }
}
