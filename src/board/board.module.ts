// src/board/board.module.ts
import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardLike } from './entities/board-like.entity';
import { BoardImage } from './entities/board-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardLike, BoardImage]),
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
