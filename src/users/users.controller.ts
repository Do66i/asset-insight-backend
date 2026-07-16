// src/users/users.controller.ts
// 클라이언트와의 접점
// 역할 : FE HTTP 요청을 받아서 데이터(DTO)가 유효한지 검증 후 비즈니스 로직을 담당하는 Service에게 넘겨주는 역할
// 목표 : Controller는 라우팅 및 단순 중계 역할에 집중하여야함
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//note @Controller('user') 데코레이터 : 이 컨트롤러가 처리할 라우팅 경로를 지정
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
      message: '회원가입 비즈니스 로직 정상적으로 실행 !!!!! 축 하 축 하 !!!!',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.usersService.findAll();
    return {
      success: true,
      message: '전체 유저 목록 조회 ✅',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(+id);
    return {
      success: true,
      message: '유저 조회 ✅',
      data: result,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(+id, updateUserDto);
    return {
      success: true,
      message: '유저 정보 변경 ✅',
      data: result,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(+id);
    return {
      success: true,
      message: '유저 삭제 ✅',
      data: result,
    };
  }
}
