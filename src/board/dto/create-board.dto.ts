// src/board/dto/create-board.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty({message: '제목은 필수값입니다.'})
  title: string;

  @IsNotEmpty({message: '본문은 필수값입니다.'})
  content: string;

}

