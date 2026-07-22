// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 기본 보안 헤더 설정 (XSS, clickjacking 등 기본 방어)
  app.use(helmet());

  // CORS 설정: 프론트(Nuxt)가 다른 오리진에서 API 호출할 수 있도록 허용
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', // 프론트 개발 서버 주소
    credentials: true, // 쿠키/인증 헤더 포함 요청 허용 (나중에 JWT 붙일 때 필요)
  });

  app.setGlobalPrefix('api');

  // 글로벌 파이프 등록: 전역에서 DTO 검증을 수행하도록 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않는 변수가 전송되면 아예 가공단계에서 제외하고 삭제처리
      forbidNonWhitelisted: true, // DTO에 없는 필드가 들어왔을 때 제거하는 데서 그치지 않고 요청 자체를 에러(400)로 막아버리는 옵션
      transform: true, // 클라이언트에서 보낸 데이터 타입을 DTO 클래스 타입으로 자동 변환해주는 옵션
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
