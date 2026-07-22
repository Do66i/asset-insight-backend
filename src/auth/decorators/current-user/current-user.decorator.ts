// src/auth/decorators/current-user/current-user.decorator.ts
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
// createParamDecorator : 파라미터 데코레이터 만드는 공장 함수
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user; // JwtStrategy가 넣어둔 { id, userId }
});
