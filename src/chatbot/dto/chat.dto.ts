import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  system_message?: string;

  @IsNumber()
  @IsOptional()
  max_tokens?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  top_p?: number;
}
