// src/board/board.service.ts
import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  /**
   * 게시글 생성
   * @param createBoardDto - 클라이언트가 보낸 게시글 데이터 (제목, 내용)
   * @param writer - 로그인한 유저 엔티티 (컨트롤러에서 @CurrentUser()로 꺼내서 넘겨줄 예정)
   * @returns 저장된 게시글 엔티티
   */

  async create(createBoardDto: CreateBoardDto, writerId: number) {
    // repository.create() : DB에 INSERT 하기 전, 메모리 상에 엔티티 객체를 만들어주는 메서드
    // 아직 DB에 저장된 게 아니라, JS 객체로만 존재하는 상태

    const board = this.boardRepository.create({
      ...createBoardDto,
      writer: { id: writerId } as User,
    });

    // repository.save() : 실제로 DB에 INSERT 쿼리를 날리고, await로 완료될 때까지 기다림
    // 저장 성공 시, DB가 자동 생성한 id/createdAt까지 채워진 최종 객체를 반환

    return await this.boardRepository.save(board);
  }

  async findAll() {
    return `This action returns all board`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return `This action updates a #${id} board`;
  }

  async remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
