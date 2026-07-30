import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createBoardDto: CreateBoardDto, @CurrentUser() writer: { id: number; userId: string }) {
    const result = await this.boardService.create(createBoardDto, writer.id);

    return {
      success: true,
      message: '게시물 등록 성공',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.boardService.findAll();
    return {
      success: true,
      message: '전체 게시물 목록 조회 성공',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.boardService.findOne(+id);
    return {
      success: true,
      message: `${id}번 게시물 조회 성공`,
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto, @CurrentUser() writer: { id: number; userId: string }) {

    const result = await this.boardService.update(+id, updateBoardDto, writer.id);

    return {
      success: true,
      message: `${id}번 게시물 수정 성공`,
      data: result,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(+id);
  }
}
