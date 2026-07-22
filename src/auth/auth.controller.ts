// src/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // AuthGuard('local')이 LocalStrategy를 실행시킴
  // → LocalStrategy.validate()가 통과하면, 그 반환값이 req.user에 자동으로 들어감
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const result = await this.authService.login(req.user);
    return {
      success: true,
      message: '로그인 성공',
      data: result,
    };
  }
}
