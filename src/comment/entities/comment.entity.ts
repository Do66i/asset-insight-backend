// src/comment/entities/comment.entity.ts
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Board } from '../../board/entities/board.entity.js';
import { CommentLike } from './comment-like.entity.js';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  // 댓글 작성자 (다대일: 여러 댓글이 한 유저에 속함)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  writer: User;

  // 댓글이 달린 게시글 (다대일: 여러 댓글이 한 게시글에 속함)
  @ManyToOne(() => Board, (board) => board.comments, { onDelete: 'CASCADE' })
  board: Board;

  // 댓글 좋아요 목록 (일대다) - 개수는 조회 시 COUNT로 계산
  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
