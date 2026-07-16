// src/asset/entities/asset.entity.ts
import { Column, CreateDateColumn, UpdateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'asset' })
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // 종목명

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  quantity: number; // 보유 수량 (소수점 단위 거래 대비 decimal)

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  avgPrice: number; // 평단가

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  currentPrice: number; // 현재가 (외부 시세 API로 주기 갱신, 아직 값 없을 수 있어 nullable)

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // 자산 분류 (예: 국내 주식, 해외 주식)

  // 여러 개의 자산은 하나의 user에게 귀속 (1:N > N 역할)
  @ManyToOne(() => User, (user) => user.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // DB에 생성될 외래키(FK) 컬럼명 지정
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

