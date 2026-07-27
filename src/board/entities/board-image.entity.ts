// src/board/entities/board-image.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity.js';

@Entity()
export class BoardImage {
  @PrimaryGeneratedColumn()
  id: number;

  // 업로드된 이미지 접근 경로 (LocalStorageService가 반환한 URL 그대로 저장)
  @Column()
  url: string;

  // 이 이미지가 속한 게시글 (다대일: 여러 이미지가 한 게시글에 속함)
  @ManyToOne(() => Board, (board) => board.images, { onDelete: 'CASCADE' })
  board: Board;
}
