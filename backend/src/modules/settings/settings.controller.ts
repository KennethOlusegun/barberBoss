import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Consultar configurações da barbearia (público)',
    description:
      'Retorna informações sobre horário de funcionamento, dias de trabalho, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações retornadas com sucesso',
    type: Settings,
  })
  async get(): Promise<Settings> {
    return this.settingsService.get();
  }

  @Patch()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar configurações da barbearia (apenas ADMIN)',
    description:
      'Permite modificar horários de funcionamento, dias de trabalho, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações atualizadas com sucesso',
    type: Settings,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas ADMIN' })
  async update(
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    return this.settingsService.update(updateSettingsDto);
  }
}
