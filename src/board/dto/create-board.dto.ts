// src/board/dto/create-board.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty({message: '제목은 필수값입니다.'})
  title: string;

  @IsNotEmpty({message: '본문은 필수값입니다.'})
  content: string;

  // 이미지 없이 글만 쓰는 경우도 있으니 선택적(optional) 필드로
  @IsOptional()
  // 배열 형태 검증
  @IsArray({ message: 'imageUrl는 배열 형태여야 합니다.'})
  // 배열 안의 각 요소가 String인지 검증 (each: true가 핵심 - 배열 전체가 아니라 원소 하나하나에 적용)
  @IsString({ each: true, message: '이미지 URL은 문자열이어야 합니다.' })
  imageUrls?: string[];
}

