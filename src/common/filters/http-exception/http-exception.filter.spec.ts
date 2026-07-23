// src/common/filters/http-exception/http-exception.filter.spec.ts
import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    // response.status(...).json(...) 체이닝을 흉내내는 모킹
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    // ArgumentsHost는 실제로 안 쓰고, catch() 내부에서 필요한 부분만 가짜로 구현
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('HttpException 발생 시 statusCode와 message를 표준 형식으로 반환한다', () => {
    const exception = new NotFoundException('존재하지 않는 유저입니다.');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: '존재하지 않는 유저입니다.',
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('HttpException이 아닌 일반 에러는 500으로 처리한다', () => {
    const exception = new Error('예상치 못한 에러');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: '서버 오류가 발생했습니다.',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it('message가 배열인 경우(class-validator)도 그대로 전달한다', () => {
    const exception = new NotFoundException({ message: ['필드1 오류', '필드2 오류'] });

    filter.catch(exception, mockHost);

    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: ['필드1 오류', '필드2 오류'],
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});
