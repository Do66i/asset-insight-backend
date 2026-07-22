// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // 유저 조회용 (UsersModule에서 export한 것)
    private readonly jwtService: JwtService, // 토큰 발급용
  ) {}

  // 로그인 시 아이디/비밀번호가 맞는지 확인 (LocalStrategy가 호출)
  async validateUser(userId: string, password: string) {
    const user = await this.usersService.findByUserId(userId); // 비밀번호 포함된 원본 조회

    if (!user) {
      // 아이디 자체가 없는 경우
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      // 비밀번호가 틀린 경우
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 검증 통과 — 비밀번호는 이후 응답/토큰에 포함되면 안 되므로 제외
    return { id: user.id, userId: user.userId };
  }

  // 검증 통과한 유저 정보로 JWT 발급
  async login(user: { id: number; userId: string }) {
    const payload = { sub: user.id, userId: user.userId }; // 토큰 안에 담을 내용물

    return {
      access_token: this.jwtService.sign(payload), // 서명된 토큰 발급
    };
  }
}
