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

  /**
   * 게시글 목록 조회
   * @returns 전체 게시글 목록 (작성자의 userId, nickname만 포함)
   */
  async findAll() :Promise<Board[]> {
    // find() : 조건 없이 전체 로우를 조회하는 기본 메서드
    // relations : 연관된 엔티티(writer)를 JOIN해서 같이 가져오라는 옵션
    //   -> 이거 없으면 board.writer가 undefined로 나옴 (지연 로딩 안 하니까)
    // select : 실제로 응답에 포함할 컬럼만 골라서 반환 (writer.password 같은 민감 정보 노출 방지)
    return await this.boardRepository.find({
      relations: {writer: true},
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true,
        writer: {
          userId: true,
          nickname: true
        }
      },
      order: { createdAt : 'DESC'}
    });
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
