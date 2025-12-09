import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../decorators/public.decorator';
import { Request } from 'express';

interface AuthenticatedUser {
  email: string;
  id: string;
  role?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verifica se a rota está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(
      `Verificando acesso: rota é pública? ${isPublic ? 'Sim' : 'Não'}`,
    );

    // Se a rota for pública, permite acesso sem verificação JWT
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = (request.headers as Record<string, string>).authorization;

    this.logger.debug(
      `Verificando token: ${token ? 'Token presente' : 'Token ausente'}`,
    );

    // Caso contrário, realiza a verificação JWT
    return super.canActivate(context);
  }

  handleRequest(err: Error, user: any, info: any): any {
    if (err || !user) {
      this.logger.error(
        `Erro de autenticação: ${err?.message || 'Usuário não encontrado'}`,
      );
      this.logger.debug(`Info de autenticação: ${JSON.stringify(info)}`);
      throw err || new UnauthorizedException('Acesso não autorizado');
    }
    this.logger.debug(
      `Usuário autenticado: ${(user as AuthenticatedUser).email}`,
    );
    return user;
  }
}
