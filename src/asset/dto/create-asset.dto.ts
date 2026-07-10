// src/asset/dto/create-asset.dto.ts
import { IsNotEmpty, IsNumber, IsNumberString, IsString, Min } from 'class-validator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
