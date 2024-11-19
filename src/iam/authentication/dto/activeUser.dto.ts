import { ObjectId } from 'mongoose';

export interface ActiveUserDTO {
  sub: ObjectId;
  name: string;
  email: string;
  role: string;
}
