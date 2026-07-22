// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module'; // UsersService를 빌려오기 위함
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule, // UsersService를 빌려오기 위함 (UsersModule이 export 해둔 상태)

    // JWT 발급 도구를 비동기 설정 - .env의 JWT_SECRET, JWT_EXPIRES_IN을 읽어와야 하므로
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // 서명용 비밀 열쇠
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }, // 유효기간
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // 전략 두 개도 여기 등록해야 Nest가 생성/관리함
})
export class AuthModule {}
