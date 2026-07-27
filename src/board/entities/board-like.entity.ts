// src/board/entities/board-like.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Board } from './board.entity.js';
import { User } from '../../users/entities/user.entity.js';

// user-board 조합에 유니크 제약을 걸어서 같은 유저가 같은 게시글에 중복 좋아요를 못 누르게 함
@Entity()
@Unique(['user', 'board'])
export class BoardLike {
  @PrimaryGeneratedColumn()
  id: number;

  // 좋아요를 누른 유저 (다대일: 한 유저가 여러 게시글에 좋아요 가능)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // 좋아요가 눌린 게시글 (다대일: 한 게시글에 여러 유저가 좋아요 가능)
  @ManyToOne(() => Board, (board) => board.likes, { onDelete: 'CASCADE' })
  board: Board;
}
