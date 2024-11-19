import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid Mongose ID format. Please provide a valid ID.',
        data: null,
      });
    }
    return value;
  }
}