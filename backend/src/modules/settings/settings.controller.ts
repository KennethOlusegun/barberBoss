import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Public() // Informações públicas sobre horário de funcionamento
  async get(): Promise<Settings> {
    return this.settingsService.get();
  }

  @Patch()
  @Roles(Role.ADMIN) // Apenas administradores podem alterar configurações
  async update(
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    return this.settingsService.update(updateSettingsDto);
  }
}
