import { IsString, IsNotEmpty } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  contact: string;
}
