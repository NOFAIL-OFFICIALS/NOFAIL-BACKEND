import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SimpleProduct {
  @IsString()
  name: string;
  @IsNumber()
  price: number;
  @IsNumber()
  stock: number;
  @IsString()
  @IsOptional()
  category: string;
}
