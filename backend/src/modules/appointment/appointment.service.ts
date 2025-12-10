import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TimeBlockService } from '../time-block/time-block.service';
import { Appointment } from './entities/appointment.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import dayjs from '../../config/dayjs.config';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly timeBlockService: TimeBlockService,
  ) {}

  /**
   * Valida se uma data está dentro do horário comercial
   * @param date Data a ser validada (em UTC)
   * @param timezone Timezone para validação
   * @param label Label para mensagem de erro (ex: 'início', 'término')
   */
  private async validateBusinessHours(
    date: Date,
    timezone: string,
    label: string = 'agendamento',
  ): Promise<void> {
    const settings = await this.settingsService.get();
    
    // Converter UTC para timezone especificado usando dayjs
    const dateInTimezone = dayjs(date).tz(timezone);
    const day = dateInTimezone.day(); // 0=domingo, 1=segunda, etc.

    // Verifica se é um dia útil
    if (!settings.workingDays.includes(day)) {
      const dayName = this.settingsService.getDayName(day);
      const workingDaysNames = settings.workingDays
        .map((d) => this.settingsService.getDayName(d))
        .join(', ');
      const dateStr = dateInTimezone.format('dddd, D [de] MMMM [de] YYYY'); // Ex: "segunda-feira, 13 de janeiro de 2026"

      throw new BadRequestException(
        `Não atendemos em ${dayName}. A data selecionada (${dateStr}) não está disponível. Dias de atendimento: ${workingDaysNames}.`,
      );
    }

    // Verifica se está dentro do horário comercial
    const hour = dateInTimezone.hour();
    const minute = dateInTimezone.minute();
    const timeInMinutes = hour * 60 + minute;
    
    // Converter horários de abertura e fechamento para minutos
    const [openHour, openMin] = settings.openTime.split(':').map(Number);
    const [closeHour, closeMin] = settings.closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    if (timeInMinutes < openMinutes || timeInMinutes >= closeMinutes) {
      const timeStr = dateInTimezone.format('HH:mm'); // Ex: "22:00"
      const dateStr = dateInTimezone.format('DD/MM/YYYY'); // Ex: "13/01/2026"
      throw new BadRequestException(
        `O horário selecionado (${timeStr} do dia ${dateStr}) está fora do nosso horário de atendimento. Funcionamos das ${settings.openTime} às ${settings.closeTime}.`,
      );
    }

    // Validar antecedência mínima
    const now = new Date();
    const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
    const diffMs = date.getTime() - now.getTime();
    if (diffMs < minAdvanceMs) {
      const hoursNeeded = settings.minAdvanceHours;
      const hoursLabel = hoursNeeded === 1 ? 'hora' : 'horas';
      throw new BadRequestException(
        `Agendamentos devem ser feitos com pelo menos ${hoursNeeded} ${hoursLabel} de antecedência. Por favor, escolha um horário mais distante.`,
      );
    }

    // Validar antecedência máxima
    const maxAdvanceMs = settings.maxAdvanceDays * 24 * 60 * 60 * 1000;
    if (diffMs > maxAdvanceMs) {
      const daysLimit = settings.maxAdvanceDays;
      const daysLabel = daysLimit === 1 ? 'dia' : 'dias';
      throw new BadRequestException(
        `Não é possível agendar com mais de ${daysLimit} ${daysLabel} de antecedência. Por favor, escolha uma data mais próxima.`,
      );
    }
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Validar que pelo menos userId ou clientName foi fornecido
    if (!createAppointmentDto.userId && !createAppointmentDto.clientName) {
      throw new BadRequestException(
        'É necessário fornecer userId ou clientName',
      );
    }

    // Verificar se o serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: createAppointmentDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(
        `O serviço selecionado não foi encontrado. Por favor, escolha um serviço válido da lista.`,
      );
    }

    if (!service.active) {
      throw new BadRequestException(
        `O serviço "${service.name}" não está mais disponível para agendamento.`,
      );
    }

    // Obter timezone do DTO (já convertido para UTC no controller)
    const timezone = createAppointmentDto.timezone || 'America/Sao_Paulo';

    // Calcular endsAt automaticamente baseado na duração do serviço
    const startsAt = new Date(createAppointmentDto.startsAt);
    const endsAt = createAppointmentDto.endsAt
      ? new Date(createAppointmentDto.endsAt)
      : new Date(startsAt.getTime() + service.durationMin * 60000); // Adiciona duração em milissegundos

    // Validar que startsAt é antes de endsAt
    if (startsAt >= endsAt) {
      const startsAtStr = startsAt.toLocaleString('pt-BR');
      const endsAtStr = endsAt.toLocaleString('pt-BR');
      throw new BadRequestException(
        `O horário de início (${startsAtStr}) deve ser anterior ao horário de término (${endsAtStr})`,
      );
    }

    // Validar horário comercial para startsAt e endsAt
    await this.validateBusinessHours(startsAt, timezone, 'início');
    await this.validateBusinessHours(endsAt, timezone, 'término');

    // Verificar se o horário está bloqueado
    const blockInfo = await this.timeBlockService.getBlockInfo(startsAt, endsAt);
    if (blockInfo) {
      const blockTypeMap = {
        LUNCH: 'horário de almoço',
        BREAK: 'pausa/intervalo',
        DAY_OFF: 'folga',
        VACATION: 'férias',
        CUSTOM: 'bloqueio personalizado',
      };
      const typeLabel = blockTypeMap[blockInfo.type] || 'bloqueio';
      const reason = blockInfo.reason ? ` (${blockInfo.reason})` : '';
      const blockTime = `${blockInfo.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às ${blockInfo.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      
      throw new ConflictException(
        `Não é possível agendar neste horário. Há um ${typeLabel}${reason} das ${blockTime}`,
      );
    }

    // Verificar se o usuário existe (se fornecido)
    if (createAppointmentDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createAppointmentDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Cliente não encontrado no sistema. Verifique se o cadastro está correto.`,
        );
      }
    }

    // Verificar conflitos de horário (prevenir overbooking)
    // REGRA: O agendamento mais antigo tem preferência
    // Se já existe um agendamento no horário, o novo será rejeitado
    const conflicts = await this.prisma.appointment.findMany({
      where: {
        OR: [
          {
            // Novo agendamento começa durante um existente
            AND: [
              { startsAt: { lte: startsAt } },
              { endsAt: { gt: startsAt } },
            ],
          },
          {
            // Novo agendamento termina durante um existente
            AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gte: endsAt } }],
          },
          {
            // Novo agendamento engloba um existente
            AND: [{ startsAt: { gte: startsAt } }, { endsAt: { lte: endsAt } }],
          },
        ],
        status: {
          notIn: ['CANCELED', 'COMPLETED', 'NO_SHOW'],
        },
      },
      include: {
        user: true,
        service: true,
      },
      orderBy: {
        createdAt: 'asc', // Mostrar o mais antigo primeiro
      },
    });

    if (conflicts.length > 0) {
      // Retorna o agendamento mais antigo que está causando o conflito
      const conflict = conflicts[0];
      const conflictClient =
        conflict.user?.name || conflict.clientName || 'Outro cliente';
      const conflictStartTime = conflict.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const conflictEndTime = conflict.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const conflictDate = conflict.startsAt.toLocaleDateString('pt-BR');
      
      throw new ConflictException(
        `Este horário já está reservado. ${conflictClient} tem um agendamento para "${conflict.service.name}" no dia ${conflictDate} das ${conflictStartTime} às ${conflictEndTime}. Por favor, escolha outro horário disponível.`,
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        startsAt,
        endsAt,
        status: createAppointmentDto.status || 'CONFIRMED',
        userId: createAppointmentDto.userId,
        clientName: createAppointmentDto.clientName,
        serviceId: createAppointmentDto.serviceId,
      },
      include: {
        user: true,
        service: true,
      },
    });

    return new Appointment(appointment);
  }

  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Appointment>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          startsAt: 'asc',
        },
      }),
      this.prisma.appointment.count(),
    ]);

    const appointmentEntities = appointments.map(
      (appointment) => new Appointment(appointment),
    );
    return new PaginatedResult(appointmentEntities, total, page, limit);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return new Appointment(appointment);
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    await this.findOne(id); // Verifica se existe

    // Se estiver atualizando datas ou serviço, validar e recalcular
    if (
      updateAppointmentDto.startsAt ||
      updateAppointmentDto.endsAt ||
      updateAppointmentDto.serviceId
    ) {
      const current = await this.prisma.appointment.findUnique({
        where: { id },
        include: { service: true },
      });

      // Se o serviço foi alterado, buscar o novo serviço
      let service = current!.service;
      if (
        updateAppointmentDto.serviceId &&
        updateAppointmentDto.serviceId !== current!.serviceId
      ) {
        const newService = await this.prisma.service.findUnique({
          where: { id: updateAppointmentDto.serviceId },
        });

        if (!newService) {
          throw new NotFoundException(
            `Serviço com ID ${updateAppointmentDto.serviceId} não encontrado`,
          );
        }
        service = newService;
      }

      const startsAt = updateAppointmentDto.startsAt
        ? new Date(updateAppointmentDto.startsAt)
        : current!.startsAt;

      // Recalcular endsAt se startsAt foi alterado e endsAt não foi fornecido
      const endsAt = updateAppointmentDto.endsAt
        ? new Date(updateAppointmentDto.endsAt)
        : updateAppointmentDto.startsAt
          ? new Date(startsAt.getTime() + service.durationMin * 60000)
          : current!.endsAt;

      if (startsAt >= endsAt) {
        throw new BadRequestException(
          'A data de início deve ser anterior à data de término',
        );
      }

      // Obter timezone do DTO ou usar padrão
      const timezone = updateAppointmentDto.timezone || 'America/Sao_Paulo';

      // Validar horário comercial para startsAt e endsAt
      await this.validateBusinessHours(startsAt, timezone, 'início');
      await this.validateBusinessHours(endsAt, timezone, 'término');

      // Verificar se o horário está bloqueado
      const isBlocked = await this.timeBlockService.isBlocked(startsAt, endsAt);
      if (isBlocked) {
        throw new BadRequestException(
          'Este horário está bloqueado (almoço, folga ou outro motivo)',
        );
      }

      // Verificar conflitos (excluindo o próprio agendamento)
      // REGRA: O agendamento mais antigo tem preferência
      // Se tentar alterar para um horário ocupado, será rejeitado
      const conflicts = await this.prisma.appointment.findMany({
        where: {
          id: { not: id },
          OR: [
            {
              AND: [
                { startsAt: { lte: startsAt } },
                { endsAt: { gt: startsAt } },
              ],
            },
            {
              AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gte: endsAt } }],
            },
            {
              AND: [
                { startsAt: { gte: startsAt } },
                { endsAt: { lte: endsAt } },
              ],
            },
          ],
          status: {
            notIn: ['CANCELED', 'COMPLETED', 'NO_SHOW'],
          },
        },
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          createdAt: 'asc', // Mostrar o mais antigo primeiro
        },
      });

      if (conflicts.length > 0) {
        // Retorna o agendamento mais antigo que está causando o conflito
        const conflict = conflicts[0];
        const conflictClient =
          conflict.user?.name || conflict.clientName || 'Outro cliente';
        const conflictTime = `${conflict.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${conflict.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

        throw new ConflictException(
          `Este horário não está disponível. ${conflictClient} já tem um agendamento de ${conflict.service.name} das ${conflictTime}`,
        );
      }

      // Atualizar com as datas calculadas
      const appointment = await this.prisma.appointment.update({
        where: { id },
        data: {
          startsAt,
          endsAt,
          ...(updateAppointmentDto.status && {
            status: updateAppointmentDto.status,
          }),
          ...(updateAppointmentDto.userId !== undefined && {
            userId: updateAppointmentDto.userId,
          }),
          ...(updateAppointmentDto.clientName !== undefined && {
            clientName: updateAppointmentDto.clientName,
          }),
          ...(updateAppointmentDto.serviceId && {
            serviceId: updateAppointmentDto.serviceId,
          }),
        },
        include: {
          user: true,
          service: true,
        },
      });

      return new Appointment(appointment);
    }

    // Se não estiver atualizando datas, apenas atualizar outros campos
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...(updateAppointmentDto.status && {
          status: updateAppointmentDto.status,
        }),
        ...(updateAppointmentDto.userId !== undefined && {
          userId: updateAppointmentDto.userId,
        }),
        ...(updateAppointmentDto.clientName !== undefined && {
          clientName: updateAppointmentDto.clientName,
        }),
        ...(updateAppointmentDto.serviceId && {
          serviceId: updateAppointmentDto.serviceId,
        }),
      },
      include: {
        user: true,
        service: true,
      },
    });

    return new Appointment(appointment);
  }

  async remove(id: string): Promise<Appointment> {
    await this.findOne(id); // Verifica se existe

    const appointment = await this.prisma.appointment.delete({
      where: { id },
    });

    return new Appointment(appointment);
  }

  // Métodos auxiliares úteis

  async findByDate(
    date: Date,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Appointment>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        where: {
          startsAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          startsAt: 'asc',
        },
      }),
      this.prisma.appointment.count({
        where: {
          startsAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    const appointmentEntities = appointments.map(
      (appointment) => new Appointment(appointment),
    );
    return new PaginatedResult(appointmentEntities, total, page, limit);
  }

  async findByUser(
    userId: string,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Appointment>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        where: { userId },
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          startsAt: 'desc',
        },
      }),
      this.prisma.appointment.count({
        where: { userId },
      }),
    ]);

    const appointmentEntities = appointments.map(
      (appointment) => new Appointment(appointment),
    );
    return new PaginatedResult(appointmentEntities, total, page, limit);
  }

  async findByStatus(
    status: string,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Appointment>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    // Validar status
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'CANCELED',
      'COMPLETED',
      'NO_SHOW',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      );
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        where: {
          status: status as
            | 'PENDING'
            | 'CONFIRMED'
            | 'CANCELED'
            | 'COMPLETED'
            | 'NO_SHOW',
        },
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          startsAt: 'asc',
        },
      }),
      this.prisma.appointment.count({
        where: {
          status: status as
            | 'PENDING'
            | 'CONFIRMED'
            | 'CANCELED'
            | 'COMPLETED'
            | 'NO_SHOW',
        },
      }),
    ]);

    const appointmentEntities = appointments.map(
      (appointment) => new Appointment(appointment),
    );
    return new PaginatedResult(appointmentEntities, total, page, limit);
  }

  /**
   * Retorna os horários disponíveis para agendamento em uma data específica
   */
  async getAvailableSlots(
    date: string,
    serviceId: string,
  ): Promise<{
    slots: string[];
    businessHours: { openTime: string; closeTime: string };
  }> {
    const settings = await this.settingsService.get();

    // Verificar se o serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Serviço com ID ${serviceId} não encontrado`);
    }

    // Converter a data para o início do dia
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Verificar se é dia útil
    const dayOfWeek = targetDate.getDay();
    if (!settings.workingDays.includes(dayOfWeek)) {
      const dayName = this.settingsService.getDayName(dayOfWeek);
      throw new BadRequestException(
        `${dayName} não é um dia útil. Dias de funcionamento: ${settings.workingDays.map((d) => this.settingsService.getDayName(d)).join(', ')}`,
      );
    }

    // Converter horários de abertura e fechamento para minutos
    const [openHour, openMin] = settings.openTime.split(':').map(Number);
    const [closeHour, closeMin] = settings.closeTime.split(':').map(Number);

    const openTimeInMinutes = openHour * 60 + openMin;
    const closeTimeInMinutes = closeHour * 60 + closeMin;

    // Buscar todos os agendamentos do dia que não foram cancelados/concluídos
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELED', 'COMPLETED', 'NO_SHOW'],
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    // Gerar todos os slots possíveis
    const availableSlots: string[] = [];
    const serviceDurationMin = service.durationMin;
    const slotInterval = settings.slotIntervalMin;

    // Iterar pelos slots possíveis
    for (
      let timeInMinutes = openTimeInMinutes;
      timeInMinutes + serviceDurationMin <= closeTimeInMinutes;
      timeInMinutes += slotInterval
    ) {
      const slotHour = Math.floor(timeInMinutes / 60);
      const slotMinute = timeInMinutes % 60;

      const slotStart = new Date(targetDate);
      slotStart.setHours(slotHour, slotMinute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setTime(slotStart.getTime() + serviceDurationMin * 60000);

      // Verificar antecedência mínima
      const now = new Date();
      const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
      if (slotStart.getTime() - now.getTime() < minAdvanceMs) {
        continue; // Pular slots que não respeitam antecedência mínima
      }

      // Verificar se o slot conflita com algum agendamento existente
      const hasConflict = existingAppointments.some((appointment) => {
        const appointmentStart = new Date(appointment.startsAt).getTime();
        const appointmentEnd = new Date(appointment.endsAt).getTime();
        const slotStartTime = slotStart.getTime();
        const slotEndTime = slotEnd.getTime();

        // Verifica se há sobreposição
        return (
          (slotStartTime >= appointmentStart &&
            slotStartTime < appointmentEnd) ||
          (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
          (slotStartTime <= appointmentStart && slotEndTime >= appointmentEnd)
        );
      });

      // Verificar se o horário está bloqueado
      const isBlocked = await this.timeBlockService.isBlocked(
        slotStart,
        slotEnd,
      );

      if (!hasConflict && !isBlocked) {
        // Formato ISO 8601 para o slot
        availableSlots.push(slotStart.toISOString());
      }
    }

    return {
      slots: availableSlots,
      businessHours: {
        openTime: settings.openTime,
        closeTime: settings.closeTime,
      },
    };
  }
}
