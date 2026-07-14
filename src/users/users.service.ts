// src/users/users.service.ts
// 도메인 비즈니스 로직 처리
// 역할 : 실제 BE 핵심 비즈니스 규칙 수행. 예를들어 '회원가입시 이미 가입된 메일인지 체크' , '비밀번호 암호화' 등
// 중요 : DB를 직접 제어하지 않고, 판단이 끝나면 저장소(Repository)에게 위임
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm'; // Repository 주입용 데코레이터
import { Repository } from 'typeorm'; // TypeORM core Repository class
import { User } from './entities/user.entity';
import { excludePassword } from '../common/utils/exclude-password.util';
import * as bcrypt from 'bcrypt';

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
    //userRepository.create() : DTO data를 바탕으로 User entity object를 메모리상에 메모함
    const { userId, email, nickname, password } = createUserDto;

    // 아이디 중복 확인
    const existingId = await this.userRepository.findOne({ where: { userId } });
    const existingEmail = await this.userRepository.findOne({ where: { email } });
    const existingNickname = await this.userRepository.findOne({ where: { nickname } });

    const duplicatedFields: string[] = [];

    if (existingId) {
      duplicatedFields.push('아이디');
    }

    if (existingEmail) {
      duplicatedFields.push('이메일');
    }

    if (existingNickname) {
      duplicatedFields.push('닉네임');
    }

    if (duplicatedFields.length > 0) {
      this.throwConfilct({
        message: `이미 존재하는 ${duplicatedFields.join(', ')}입니다.`,
      });
    }

    const saltRounds = 10; // 해싱강도
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // !! 중요 !! : .save()를 호출 후 'await'로 기다려야 실제 MySQL DB에 INSERT query가 날아가서 영구저장함
    // 성공시 MySQL이 자동으로 생성해준 id와 가입시간(createAt)이 채워진 최종 user object return

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    return excludePassword(savedUser);
  }

  async findAll() {
    // 전체 유저 목록 조회
    const users = await this.userRepository.find();

    return users.map((el) => excludePassword(el));
  }

  // ID로 유저 한 명 조회
  // update, remove 등에서도 '존재 확인'단계로 재사용될 기반 로직
  async findOne(id: number) {
    const user = await this.findUserOrFail(id);
    return excludePassword(user);
  }

  // 기존 엔티티 재사용, 중복 체크를 자기 자신은 제외용
  async update(id: number, updateUserDto: UpdateUserDto) {
    // 존재 확인 + 원본 entity(user, password 포함)
    const user = await this.findUserOrFail(id);
    const { userId, email, nickname, password } = updateUserDto;

    // 자기 자신을 제외한 중복 체크
    const duplicatedFields: string[] = [];

    if (userId) {
      const existingId = await this.userRepository.findOne({where: {userId}});
      if (existingId && existingId.id !== id) {
        duplicatedFields.push('id');
      }
    }

    if (email) {
      const existingEmail = await this.userRepository.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== id) {
        duplicatedFields.push('email');
      }
    }

    if (nickname) {
      const existingNickname = await this.userRepository.findOne({ where: { nickname } });
      if (existingNickname && existingNickname.id !== id) {
        duplicatedFields.push('nickname');
      }
    }

    if (duplicatedFields.length > 0) {
      this.throwConfilct({
        message: `이미 존재하는 ${duplicatedFields.join(', ')}입니다.`,
      });
    }

    // 비밀번호가 수정 요청에 포함된 경우만 재해싱
    let hashedPassword: string | undefined;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // 기존 entity(user)에 수정 요청 필드를 덮어씀. 비밀번호는 해싱된 값 우선 적용
    const updateUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
      ...(hashedPassword && { password: hashedPassword }),
    })

    return excludePassword(updateUser);
  }

  async remove(id: number) {
    const user = await this.findUserOrFail(id);

    await  this.userRepository.remove(user);

    return { id }
  }

  private throwConfilct(customFields: { message: string }) {
    const base = new ConflictException().getResponse() as object;
    console.log('>>>>>>>', new ConflictException().getResponse());
    throw new ConflictException({
      ...base,
      success: false,
      ...customFields,
    });
  }

  private async findUserOrFail(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`존재하지 않는 유저입니다. (id: ${id})`);
    }

    return user;
  }
}
