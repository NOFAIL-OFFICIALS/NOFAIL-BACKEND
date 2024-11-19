import {
  IsEmail,
  IsString,
  IsStrongPassword,
  isStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  businessName: string;

  @IsString()
  cacNumber: string;

  @IsStrongPassword()
  confirmPassword: string;
}
