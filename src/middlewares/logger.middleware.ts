// src/middlewares/logger.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP-REQUEST');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;

    // 단순하게 요청이 들어왔다는 사실만 가장 먼저 터미널에 알려줌
    this.logger.log(`▶ [${method}] ${originalUrl} | IP: ${ip}`);

    next();
  }
}
