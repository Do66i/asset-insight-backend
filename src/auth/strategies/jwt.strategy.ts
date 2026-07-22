// src/auth/strategies/jwt.strategy.ts
// Authorization: Bearer <token> 헤더가 있는 요청을 검증하는 Passport 전략

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      // .env에 JWT_SECRET이 없으면 서버 부팅 자체를 막음 (보안 키 없이 뜨는 걸 방지)
      throw new Error('JWT_SECRET이 설정되지 않았습니다. .env 파일을 확인하세요.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization: Bearer <토큰>에서 추출
      ignoreExpiration: false, // 만료된 토큰은 거부
      secretOrKey: secret, // 이제 string으로 타입 확정됨
    });
  }

  // 토큰 서명 검증에 성공하면, 토큰 안에 있던 payload가 여기로 넘어옴
  async validate(payload: { sub: number; userId: string }) {
    // 여기서 반환한 값이 request.user에 들어감 (컨트롤러에서 @CurrentUser()로 꺼내 쓸 값)
    return { id: payload.sub, userId: payload.userId };
  }
}
