// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 글로벌 프리픽스 설정 (예: localhost:3000/api/users 형태로 라우팅 경로 통일)
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
