import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém as configurações do sistema (sempre existe apenas uma linha)
   */
  async get(): Promise<Settings> {
    let settings = await this.prisma.settings.findFirst();

    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          businessName: 'Barber Boss',
          openTime: '08:00',
          closeTime: '18:00',
          workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
          slotIntervalMin: 15,
          maxAdvanceDays: 30,
          minAdvanceHours: 2,
          enableReminders: false,
          reminderHoursBefore: 24,
        },
      });
    }

    return new Settings(settings);
  }

  /**
   * Atualiza as configurações do sistema
   */
  async update(updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
    const current = await this.get();

    // Validar horários
    if (updateSettingsDto.openTime || updateSettingsDto.closeTime) {
      const openTime = updateSettingsDto.openTime || current.openTime;
      const closeTime = updateSettingsDto.closeTime || current.closeTime;

      if (this.timeToMinutes(openTime) >= this.timeToMinutes(closeTime)) {
        throw new BadRequestException(
          'O horário de abertura deve ser anterior ao horário de fechamento',
        );
      }
    }

    // Validar workingDays (não pode ter duplicados)
    if (updateSettingsDto.workingDays) {
      const uniqueDays = [...new Set(updateSettingsDto.workingDays)];
      if (uniqueDays.length !== updateSettingsDto.workingDays.length) {
        throw new BadRequestException(
          'workingDays não pode ter dias duplicados',
        );
      }
    }

    const updated = await this.prisma.settings.update({
      where: { id: current.id },
      data: updateSettingsDto,
    });

    return new Settings(updated);
  }

  /**
   * Verifica se um horário está dentro do horário comercial
   */
  isWithinBusinessHours(date: Date): boolean {
    const settings = this.getCachedSettings();
    if (!settings) return true; // Fallback se não houver configurações

    const day = date.getDay();
    const timeInMinutes = date.getHours() * 60 + date.getMinutes();

    // Verifica se é dia útil
    if (!settings.workingDays.includes(day)) {
      return false;
    }

    // Verifica se está dentro do horário
    const openMinutes = this.timeToMinutes(settings.openTime);
    const closeMinutes = this.timeToMinutes(settings.closeTime);

    return timeInMinutes >= openMinutes && timeInMinutes < closeMinutes;
  }

  /**
   * Obtém o nome do dia da semana em português
   */
  getDayName(dayNumber: number): string {
    const days = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    return days[dayNumber] || 'Dia inválido';
  }

  /**
   * Converte string de horário (HH:mm) para minutos
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Cache simples das configurações (recarrega a cada minuto)
  private cachedSettings: Settings | null = null;
  private lastCacheTime: number = 0;
  private readonly CACHE_DURATION_MS = 60000; // 1 minuto

  private getCachedSettings(): Settings | null {
    const now = Date.now();
    if (now - this.lastCacheTime > this.CACHE_DURATION_MS) {
      this.cachedSettings = null;
    }
    return this.cachedSettings;
  }

  /**
   * Atualiza o cache de configurações
   */
  async refreshCache(): Promise<void> {
    this.cachedSettings = await this.get();
    this.lastCacheTime = Date.now();
  }
}
