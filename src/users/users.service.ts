// src/users/users.service.ts
// 도메인 비즈니스 로직 처리
// 역할 : 실제 BE 핵심 비즈니스 규칙 수행. 예를들어 '회원가입시 이미 가입된 메일인지 체크' , '비밀번호 암호화' 등
// 중요 : DB를 직접 제어하지 않고, 판단이 끝나면 저장소(Repository)에게 위임
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm'; // Repository 주입용 데코레이터
import { Repository } from 'typeorm'; // TypeORM core Repository class
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // constructor(생성자)를 통해 Nest.js가 관리하는 User Repository instance를 동적으로 주입
  // @InjectRepository(User): 어떤 엔티티의 Repository를 주입할지 지정
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 회원가입 처리하는 핵심 비즈니스 로직
  // !! DB query는 network를 타고 비동기로 작동함.
  async create(createUserDto: CreateUserDto) {
    console.log('회원가입 작동 확인', createUserDto);

    //userRepository.create() : DTO data를 바탕으로 User entity object를 메모리상에 메모함
    const newUser = await this.userRepository.save(createUserDto);

    // !! 중요 !! : .save()를 호출 후 'await'로 기다려야 실제 MySQL DB에 INSERT query가 날아가서 영구저장함
    // 성공시 MySQL이 자동으로 생성해준 id와 가입시간(createAt)이 채워진 최종 user object return
    const savedUser = await this.userRepository.save(newUser);

    // 성공 메세지 반환
    return {
      success: true,
      message: '회원가입 비즈니스 로직 정상적으로 실행 & DB 확인해보슈',
      data: savedUser,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
