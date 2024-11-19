import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; message: string; data: null } {
    return {
      status: 'success',
      message: 'You are connected to the API',
      data: null,
    };
  }
}
