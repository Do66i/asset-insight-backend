// src/users/users.controller.ts
// 클라이언트와의 접점
// 역할 : FE HTTP 요청을 받아서 데이터(DTO)가 유효한지 검증 후 비즈니스 로직을 담당하는 Service에게 넘겨주는 역할
// 목표 : Controller는 라우팅 및 단순 중계 역할에 집중하여야함
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// @Controller('user') 데코레이터 : 이 컨트롤러가 처리할 라우팅 경로를 지정
@Controller('user')
export class UsersController {
  // 생성자를 통해 비즈니스 로직이 담긴 UserService instance 주입
  constructor(private readonly usersService: UsersService) {}

  // @Post() 데코레이터 : HTTP POST 요청을 처리하는 라우팅 경로 지정
  // @Body() 데코레이터 : HTTP 요청 본문에서 데이터를 추출후 지정한 DTO 객체 구조로 파싱해줌
  @Post()
  // service가 비동기(async)로 작동하므로 controller method에도 async 필요, 호출시 await 필요
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    // 비즈니스 로직 처리를 위해 서비스의 create method로 data 토스함
    return {
      success: true,
      message: '회원가입 비즈니스 로직 정상적으로 실행 & DB 확인해보슈',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
