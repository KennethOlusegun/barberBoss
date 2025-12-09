import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserFromJwt } from '../auth/models/UserFromJwt';

/**
 * Decorator para obter o usuário autenticado da requisição
 * @example
 * @Get('me')
 * async getProfile(@CurrentUser() user: UserFromJwt) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserFromJwt => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
