import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordForgotDto } from './dto/password-forgot.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import * as bcrypt from 'bcrypt';
import { BrevoService } from './brevo.service';

@Injectable()
export class PasswordForgotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly brevoService: BrevoService,
  ) {}

  async requestPasswordReset(dto: PasswordForgotDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    // Gera token JWT curto (ex: 1h)
    const token = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '1h' },
    );
    // Enviar e-mail com o link de redefinição
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${token}`;
    console.log('[PasswordForgotService] Token de recuperação:', token);
    console.log('[PasswordForgotService] Link de redefinição:', resetLink);
    await this.brevoService.sendPasswordResetEmail(user.email, resetLink);
    return {
      message: 'Se o e-mail existir, um link de redefinição foi enviado.',
      token,
    };
  }

  async resetPassword(dto: PasswordResetDto) {
    let payload: { userId: string };
    try {
      payload = this.jwtService.verify<{ userId: string }>(dto.token);
    } catch {
      throw new BadRequestException('Token inválido ou expirado');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    return { message: 'Senha redefinida com sucesso' };
  }
}
