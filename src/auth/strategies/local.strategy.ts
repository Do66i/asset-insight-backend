// src/auth/strategies/local.strategy.ts
// 로그인 요청 (POST /auth/login) 시 아이디/비밀번호를 검증하는 passport 전략

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable() //
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private  readonly authService: AuthService) {
  super({ usernameField: 'userId'}); // 기본은 'username' 필드명, 우리는 userId로 받으니까 변경
  }

  // Passport가 요청 body에서 userId, password를 자동으로 꺼내서 이 메서드에 넘겨줌
  async validate(userId: string, password: string): Promise<any> {
    // 검증 실패 시 AuthService.validateUser 내부에서 이미 UnauthorizedException을 던짐
    return this.authService.validateUser(userId, password);
  }
}
