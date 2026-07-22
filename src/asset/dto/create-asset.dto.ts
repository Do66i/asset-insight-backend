// src/asset/dto/create-asset.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

// note: currentPrice ? 사용자가 입력하는 값이 아니라 api가 나중에 채워주는 값이기 때문에 생성시점에선 필요없음
// note: userId는 더 이상 요청 body로 안 받음 — 로그인한 사람(토큰)의 userId를 서버가 강제로 사용
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
}
