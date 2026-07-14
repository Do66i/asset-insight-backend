// src/asset/dto/create-asset.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

// note: currentPrice ? 사용자가 입력하는 값이 아니라 api가 나중에 채워주는 값이기 때문에 생성시점에선 필요없음
export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  name: string; // 종목명

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  quantity: number; // 보유 수량

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  avgPrice: number; // 평단가

  @IsNotEmpty()
  @IsString()
  category: string; // 자산 분류

  @IsNotEmpty()
  @IsString()
  userId: string; // 자산을 등록할 대상 유저 식별자 (FK 조회용, 엔티티엔 없는 요청 전용 필드)
}
