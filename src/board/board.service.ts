// src/board/board.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardImage } from './entities/board-image.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

export interface BoardDetail {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  createdAt: Date;
  writer: {
    userId: string;
    nickname: string;
  };
}

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    // BoardImage 전용 repository도 따로 주입받음 (다른 entity라서 별도 Repository 필요)
    @InjectRepository(BoardImage)
    private readonly boardImageRepository: Repository<BoardImage>,
  ) {}

  /**
   * 게시글 생성
   * @param createBoardDto - 클라이언트가 보낸 게시글 데이터 (제목, 내용)
   * @param writer - 로그인한 유저 엔티티 (컨트롤러에서 @CurrentUser()로 꺼내서 넘겨줄 예정)
   * @returns 저장된 게시글 엔티티
   */

  async create(createBoardDto: CreateBoardDto, writerId: number) {
    // imageUrls는 Board 엔티티 필드가 아니라 BoardImage 저장용 별도 데이터라서
    // 구조 분해로 분리해둠 (board에는 title, content만 남게)
    const { imageUrls, ...boardData } = createBoardDto;

    // repository.create() : DB에 INSERT 하기 전, 메모리 상에 엔티티 객체를 만들어주는 메서드
    // 아직 DB에 저장된 게 아니라, JS 객체로만 존재하는 상태

    const board = this.boardRepository.create({
      ...createBoardDto,
      writer: { id: writerId } as User,
    });

    // repository.save() : 실제로 DB에 INSERT 쿼리를 날리고, await로 완료될 때까지 기다림
    // 저장 성공 시, DB가 자동 생성한 id/createdAt까지 채워진 최종 객체를 반환
    const savedBoard = await this.boardRepository.save(board);

    // 첨부 이미지가 있으면, 방금 저장된 게시글의 id로 BoardImage 레코드들을 만들어 저장
    // imageUrls가 없거나 빈 배열이면 이 블록 자체를 건너뜀
    if (imageUrls && imageUrls.length > 0) {
      // map() : 배열의 각 URL 문자열을, BoardImage 엔티티 형태의 객체로 하나씩 변환
      const boardImages = imageUrls.map((url) =>
        this.boardImageRepository.create({
          url,
          board: savedBoard, // 방금 생성된 게시글과 관계 연결 (board.id가 FK로 채워짐)
        }),
      );
      // save()에 배열을 넘기면 여러 로우를 한 번에 INSERT
      await this.boardImageRepository.save(boardImages);
    }

    return savedBoard;
  }

  /**
   * 게시글 목록 조회
   * @returns 전체 게시글 목록 (작성자의 userId, nickname만 포함)
   */
  async findAll(): Promise<Board[]> {
    // find() : 조건 없이 전체 로우를 조회하는 기본 메서드
    // relations : 연관된 엔티티(writer)를 JOIN해서 같이 가져오라는 옵션
    //   -> 이거 없으면 board.writer가 undefined로 나옴 (지연 로딩 안 하니까)
    // select : 실제로 응답에 포함할 컬럼만 골라서 반환 (writer.password 같은 민감 정보 노출 방지)
    return await this.boardRepository.find({
      relations: { writer: true },
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true,
        writer: {
          userId: true,
          nickname: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BoardDetail> {
    // increment() : UPDATE board SET viewCount = viewCount + 1 WHERE id = ? 쿼리 실행
    // 반환값(UpdateResult)의 affected : 실제로 몇 개 로우가 수정됐는지 알려주는 숫자
    //   -> 해당 id가 없으면 UPDATE 대상이 없어서 affected가 0으로 나옴
    //   -> 이 값으로 "존재하는 게시글인지"까지 같이 판단 가능 (별도 조회 쿼리 불필요)

    const { affected } = await this.boardRepository.increment({ id }, 'viewCount', 1);
    if (!affected) {
      throw new NotFoundException(`존재하지 않는 게시물입니다. (id: ${id})`);
    }
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: { writer: true },
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true,
        writer: {
          userId: true,
          nickname: true,
        },
      },
    });
    return board as BoardDetail;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto, requesterId: number) {
    const board = await this.findBoardOrFail(id);
    if (board.writer.id !== requesterId) {
      throw new ForbiddenException('본인 게시물만 수정할 수 있습니다.');
    }
    const updatedBoard = await this.boardRepository.save({
      ...board,
      ...updateBoardDto,
    });
    return updatedBoard;
  }

  async remove(id: number, requesterId: number): Promise<{ id: number }> {
    const board = await this.findBoardOrFail(id);

    if (board.writer.id !== requesterId) {
      throw new ForbiddenException('본인 게시물만 수정할 수 있습니다.');
    }

    await this.boardRepository.remove(board);

    return { id };
  }

  // 내부 전용: ID로 게시물 엔티티 원본 조회
  // update, remove에서만 재사용 — 존재 확인 + 엔티티 전체 필요
  private async findBoardOrFail(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id }, relations: { writer: true } });

    if (!board) {
      throw new NotFoundException(`존재하지 않는 게시물입니다. (id: ${id})`);
    }

    return board;
  }
}

