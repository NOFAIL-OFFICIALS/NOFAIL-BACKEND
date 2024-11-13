import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ActiveUserDTO } from '../dto/ActiveUser.dto';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserDTO | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: ActiveUserDTO = request.user;
    return field ? user?.[field] : user;
  },
);
