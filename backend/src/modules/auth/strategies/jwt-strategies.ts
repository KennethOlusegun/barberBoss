import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserFromJwt } from '../models/UserFromJwt';
import { UserPayload } from '../models/UserPayload';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default_secret_key',
    });

    this.logger.log(
      `JwtStrategy inicializada com secret: ${configService.get<string>('JWT_SECRET') ? 'configurado' : 'usando default'}`,
    );
  }

  async validate(payload: UserPayload): Promise<UserFromJwt> {
    this.logger.debug(`Validando payload do JWT: ${JSON.stringify(payload)}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        this.logger.error(`Usuário não encontrado para o ID: ${payload.id}`);
        throw new UnauthorizedException('Usuário não encontrado ou inválido.');
      }

      this.logger.debug(`Usuário encontrado: ${user.email}`);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(
        `Erro na validação do JWT: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
