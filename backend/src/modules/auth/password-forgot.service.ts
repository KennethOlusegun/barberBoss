
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordForgotDto } from './dto/password-forgot.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import * as bcrypt from 'bcrypt';
import { BrevoService } from './brevo.service';


@Injectable()
export class PasswordForgotService {
  private readonly logger = new Logger(PasswordForgotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly brevoService: BrevoService,
  ) {}

  /**
   * Método antigo (mantido para compatibilidade)
   */
  async requestPasswordResetOld(dto: PasswordForgotDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const token = this.jwtService.sign({ userId: user.id }, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${token}`;
    this.logger.log(`[Antigo] Token de recuperação: ${token}`);
    this.logger.log(`[Antigo] Link de redefinição: ${resetLink}`);
    await this.brevoService.sendPasswordResetEmail(user.email, resetLink);
    return {
      message: 'Se o e-mail existir, um link de redefinição foi enviado.',
      token,
    };
  }

  /**
   * Gera código aleatório de 6 dígitos
   */
  private generateRecoveryCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  /**
   * Solicita envio de código de recuperação por email
   */
  async requestPasswordReset(dto: PasswordForgotDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Segurança: nunca revela se existe ou não
    if (!user) {
      this.logger.warn(`[Recuperação] Tentativa para email inexistente: ${dto.email}`);
      return { message: 'Código enviado para seu email.' };
    }

    // Invalida códigos antigos
    await this.prisma.recoveryCode.updateMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      data: { used: true },
    });

    const code = this.generateRecoveryCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.prisma.recoveryCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    this.logger.log(`[Recuperação] Código gerado para ${user.email}: ${code}`);
    await this.brevoService.sendRecoveryCodeEmail(user.email, user.name, code);
    return { message: 'Código enviado para seu email.' };
  }

  /**
   * Redefine a senha usando código de 6 dígitos
   */
  async resetPassword(dto: PasswordResetDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      this.logger.warn(`[Reset] Tentativa para email inexistente: ${dto.email}`);
      throw new BadRequestException('Código inválido ou expirado');
    }

    const recovery = await this.prisma.recoveryCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!recovery) {
      this.logger.warn(`[Reset] Código inválido/expirado para ${user.email}`);
      throw new BadRequestException('Código inválido ou expirado');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      this.prisma.recoveryCode.update({ where: { id: recovery.id }, data: { used: true } }),
    ]);

    this.logger.log(`[Reset] Senha redefinida para ${user.email}`);
    return { message: 'Senha redefinida com sucesso!' };
  }
}
