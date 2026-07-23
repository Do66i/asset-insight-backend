// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// @Catch() : 인자 없이 쓰면 애플리케이션에서 발생하는 '모든' 예외를 다 잡는다는 뜻
// (특정 예외만 잡고 싶으면 @Catch(HttpException) 이런 식으로 타입을 지정함)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // ExceptionFilter 인터페이스를 구현하려면 반드시 catch() 메서드가 있어야 함
  // exception: 실제로 터진 에러 객체 (타입을 모르니까 unknown)
  // host: 지금 이 요청이 http인지 websocket인지 등 '실행 컨텍스트' 정보를 담고 있음
  catch(exception: unknown, host: ArgumentsHost) {
    // host를 http 컨텍스트로 전환 (여기선 무조건 http라서 이렇게 씀)
    const ctx = host.switchToHttp();
    // express의 response 객체를 꺼냄 -> 이걸로 직접 status/json을 내려줄 거임
    const response = ctx.getResponse<Response>();

    // 터진 예외가 NestJS의 HttpException 계열(NotFoundException, ConflictException 등)이면
    // 그 예외가 갖고 있는 진짜 상태코드(404, 409 등)를 꺼내서 쓰고
    // 그게 아니라 그냥 일반 JS Error나 예상 못한 에러면 500으로 처리
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // HttpException이면 getResponse()로 그 안에 담긴 응답 내용(메시지 등)을 꺼냄
    // HttpException이 아니면(=일반 에러) 꺼낼 게 없으니까 null
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

    // 메시지를 최종적으로 정리하는 부분
    // - exceptionResponse가 그냥 문자열이면(예: throw new NotFoundException('없음')) 그대로 사용
    // - 문자열이 아니면(예: class-validator가 만든 { message: [...] } 형태) message 필드를 꺼내서 사용
    // - 그것도 없으면(=일반 에러라 exceptionResponse 자체가 null인 경우) 기본 문구로 대체
    const message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as { message?: string | string[] })?.message || '서버 오류가 발생했습니다.';

    // 실제로 클라이언트에게 내려가는 최종 응답
    // 정상 응답 포맷이 { success: true, message, data } 였으니까
    // 에러 응답도 형태를 맞춰서 { success: false, message, statusCode } 로 통일
    response.status(status).json({
      success: false,
      message,
      statusCode: status,
    });
  }
}
