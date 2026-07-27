// src/board/entities/board.entity.ts
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { BoardImage } from './board-image.entity.js';
import { Comment } from '../../comment/entities/comment.entity.js';
import { BoardLike } from './board-like.entity.js';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // 에디터에서 오는 HTML 통짜 저장이라 text 타입으로
  @Column('text')
  content: string;

  // 기본값 0으로 시작, 상세 조회 API 호출될 때마다 증가시킬 예정
  @Column({ default: 0 })
  viewCount: number;

  // 게시글 작성자 (다대일: 여러 게시글이 한 유저에 속함)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  writer: User;

  // 게시글에 첨부된 이미지 목록 (일대다)
  @OneToMany(() => BoardImage, (image) => image.board)
  images: BoardImage[];

  // 게시글에 달린 댓글 목록 (일대다)
  @OneToMany(() => Comment, (comment) => comment.board)
  comments: Comment[];

  // 게시글 좋아요 목록 (일대다) - 개수는 조회 시 COUNT로 계산
  @OneToMany(() => BoardLike, (like) => like.board)
  likes: BoardLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
