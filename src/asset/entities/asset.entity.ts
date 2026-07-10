// src/asset/entities/asset.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'asset' })
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // 자산 이름

  @Column({ type: 'bigint', default: 0 })
  amount: number; // 자산 총액

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // 자산 분류 (예: 국내 주식, 해외 주식)

  // 여러 개의 자산은 하나의 user에게 귀속 (1:N > N 역할)
  @ManyToOne(() => User, (user) => user.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // DB에 생성될 외래키(FK) 컬럼명 지정
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  updateAt: Date;
}

