import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PasswordForgotService } from './password-forgot.service';
import { PasswordForgotDto } from './dto/password-forgot.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { Public } from '../../decorators/public.decorator';

@ApiTags('auth')
@Controller('auth/password')
export class PasswordForgotController {
  constructor(private readonly passwordForgotService: PasswordForgotService) {}

  @Public()
  @Post('forgot')
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiResponse({
    status: 200,
    description: 'Se o e-mail existir, um link de redefinição foi enviado.',
  })
  async forgot(@Body() dto: PasswordForgotDto) {
    return this.passwordForgotService.requestPasswordReset(dto);
  }

  @Public()
  @Post('reset')
  @ApiOperation({ summary: 'Redefinir senha com token' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  async reset(@Body() dto: PasswordResetDto) {
    return this.passwordForgotService.resetPassword(dto);
  }
}
