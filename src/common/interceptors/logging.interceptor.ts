// src/common/interceptors/logging.interceptor.ts

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP-RESPONSE');

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const { method, url } = request;
    const startTime = Date.now();

    // next.handle() : controller 로직이 완전히 실행된 후 클라이언트로 나가는 응답 스트림
    // .pipe(tap(...)) : 패턴을 사용하면 안전하게 응답 데이터(body)의 원본을 복사하여 관찰
    return next.handle().pipe(
      tap({
        next: (data) => {
          const { statusCode } = response;
          const duration = Date.now() - startTime;
          // 성공 시 리턴데는 데이터 본문 로깅
          const responseData = data ? JSON.stringify(data) : '🤷‍♂️ No Content ~ 🤷‍♂️';

          this.logger.log(`✅ [${method}] ${url} ${statusCode} - ${duration}ms`, `✏️ : ${responseData}`);
        },

        error: (err) => {
          const duration = Date.now() - startTime;
          // 검문소(ValidationPipe) 등에서 에러가 발생했을 때 뿜어내는 상세 메세지를 추출
          const statusCode = err.status || 500;
          const errorMessage = err.response ? JSON.stringify(err.response.message || err.response) : err.message;

          this.logger.error(`❌ [${method}] ${url} ${statusCode} - ${duration}ms`, `✏️ : ${errorMessage}`);
        },
      }),
    );
  }
}
