import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  description: string;

  @IsString()
  image_url: string;

  @IsNumber()
  stock: number;

  @IsString()
  type: string;

  @IsString()
  user_id: string;
}
