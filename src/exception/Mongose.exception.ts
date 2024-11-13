import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch()
export class MongooseDuplicateExceptionFilter<T extends MongoError>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();

    let error;

    switch (exception.code) {
      case 11000:
        response.statusCode = HttpStatus.FORBIDDEN;
        response.json({
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
          message: 'You are already registered',
        });
        break;

      default:
        break;
    }
  }
}
