// src/comment/entities/comment-like.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Comment } from './comment.entity.js';
import { User } from '../../users/entities/user.entity.js';

// user-comment 조합에 유니크 제약을 걸어서 같은 유저가 같은 댓글에 중복 좋아요를 못 누르게 함
@Entity()
@Unique(['user', 'comment'])
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  // 좋아요를 누른 유저 (다대일: 한 유저가 여러 댓글에 좋아요 가능)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // 좋아요가 눌린 댓글 (다대일: 한 댓글에 여러 유저가 좋아요 가능)
  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  comment: Comment;
}
