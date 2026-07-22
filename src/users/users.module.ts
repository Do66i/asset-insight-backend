// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // TypeORM 모듈 임포트
import { User } from './entities/user.entity'; // 엔티티 임포트

@Module({
  imports: [
    // 이 모듈 내부에서 User 엔티티에 접근할 수 있도록 Repository를 Feature로 등록
    // UserService에서 User Repository를 의존성 주입(DI) 받을 수 있음
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
  /**
   * TypeOrmModule : 다른 모듈에서 User 리포지토리를 재사용할 수 있도록 export
   * UsersService : AuthModule에서 로그인 검증 시 UsersService 재사용
   */
})
export class UsersModule {}
