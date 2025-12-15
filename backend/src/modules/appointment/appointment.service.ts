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
   */
  private async validateBusinessHours(
    date: Date,
    timezone: string,
  ): Promise<void> {
    const settings = await this.settingsService.get();

    // LOGS DE DEBUG PARA FUSO/DIA DA SEMANA

    console.log('--- [DEBUG] validateBusinessHours ---');
    // Valor original recebido
    console.log('date (original, Date):', date, '| ISO:', date.toISOString());
    // Interpretação UTC
    const dateUtc = dayjs.utc(date);
    console.log('dateUtc (dayjs.utc):', dateUtc.format());
    // Convertido para timezone
    const dateInTimezone = dateUtc.tz(timezone);
    console.log(
      'dateInTimezone:',
      dateInTimezone.format(),
      '| Timezone:',
      timezone,
    );
    // Dia da semana calculado
    const day = dateInTimezone.day();
    console.log(
      'day (0=Domingo):',
      day,
      '| Nome:',
      this.settingsService.getDayName(day),
    );
    // Dias úteis do sistema
    console.log('settings.workingDays:', settings.workingDays);

    // Verifica se é um dia útil
    if (!settings.workingDays.includes(day)) {
      const dayName = this.settingsService.getDayName(day);
      const workingDaysNames = settings.workingDays
        .map((d) => this.settingsService.getDayName(d))
        .join(', ');
      const dateStr = dateInTimezone.format('dddd, D [de] MMMM [de] YYYY');

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
      const timeStr = dateInTimezone.format('HH:mm');
      const dateStr = dateInTimezone.format('DD/MM/YYYY');
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
    // LOG DE DEBUG: início do método create

    console.log('--- [DEBUG] AppointmentService.create ---');
    console.log(
      'Payload recebido:',
      JSON.stringify(createAppointmentDto, null, 2),
    );

    // ✅ FIX 1: Validação XOR entre userId e clientName
    // Garantir que exatamente um está preenchido (não ambos, não nenhum)
    const hasUserId = !!createAppointmentDto.userId;
    const hasClientName = !!createAppointmentDto.clientName?.trim();

    if (!hasUserId && !hasClientName) {
      throw new BadRequestException(
        'É necessário fornecer userId (cliente cadastrado) ou clientName (agendamento manual).',
      );
    }

    if (hasUserId && hasClientName) {
      throw new BadRequestException(
        'Forneça APENAS userId (cliente cadastrado) OU clientName (agendamento manual), não ambos.',
      );
    }

    // Verificar se o serviço existe e está ativo
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

    // Obter timezone do DTO (padrão: America/Sao_Paulo)
    const timezone = createAppointmentDto.timezone || 'America/Sao_Paulo';

    // ✅ FIX 2: Sempre usar dayjs.utc para parsing de datas recebidas do frontend
    const startsAt = dayjs.utc(createAppointmentDto.startsAt).toDate();

    // Calcular endsAt automaticamente baseado na duração do serviço
    const endsAt = createAppointmentDto.endsAt
      ? dayjs.utc(createAppointmentDto.endsAt).toDate()
      : dayjs.utc(startsAt).add(service.durationMin, 'minutes').toDate();

    // Validar que startsAt é antes de endsAt
    if (startsAt >= endsAt) {
      const startsAtStr = dayjs(startsAt)
        .tz(timezone)
        .format('DD/MM/YYYY HH:mm');
      const endsAtStr = dayjs(endsAt).tz(timezone).format('DD/MM/YYYY HH:mm');
      throw new BadRequestException(
        `O horário de início (${startsAtStr}) deve ser anterior ao horário de término (${endsAtStr})`,
      );
    }

    // Validar horário comercial para startsAt e endsAt
    await this.validateBusinessHours(startsAt, timezone);
    await this.validateBusinessHours(endsAt, timezone);

    // Verificar se o horário está bloqueado
    const blockInfo = await this.timeBlockService.getBlockInfo(
      startsAt,
      endsAt,
    );
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
      const blockTime = `${dayjs(blockInfo.startsAt).tz(timezone).format('HH:mm')} às ${dayjs(blockInfo.endsAt).tz(timezone).format('HH:mm')}`;

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

    // Usar transação com isolamento Serializable para prevenir race conditions
    const appointment = await this.prisma.$transaction(
      async (tx) => {
        // Verificar conflitos de horário dentro da transação (prevenir overbooking)
        const conflicts = await tx.appointment.findMany({
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
                AND: [
                  { startsAt: { lt: endsAt } },
                  { endsAt: { gte: endsAt } },
                ],
              },
              {
                // Novo agendamento engloba um existente
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
            createdAt: 'asc',
          },
        });

        if (conflicts.length > 0) {
          const conflict = conflicts[0];
          const conflictClient =
            conflict.user?.name || conflict.clientName || 'Outro cliente';
          const conflictStartTime = dayjs(conflict.startsAt)
            .tz(timezone)
            .format('HH:mm');
          const conflictEndTime = dayjs(conflict.endsAt)
            .tz(timezone)
            .format('HH:mm');
          const conflictDate = dayjs(conflict.startsAt)
            .tz(timezone)
            .format('DD/MM/YYYY');

          throw new ConflictException(
            `Este horário já está reservado. ${conflictClient} tem um agendamento para "${conflict.service.name}" no dia ${conflictDate} das ${conflictStartTime} às ${conflictEndTime}. Por favor, escolha outro horário disponível.`,
          );
        }

        // Criar o agendamento dentro da transação
        return await tx.appointment.create({
          data: {
            startsAt,
            endsAt,
            status: createAppointmentDto.status || 'CONFIRMED',
            userId: createAppointmentDto.userId,
            clientName: createAppointmentDto.clientName?.trim(),
            serviceId: createAppointmentDto.serviceId,
          },
          include: {
            user: true,
            service: true,
          },
        });
      },
      {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      },
    );

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

  // ✅ FIX 3: Método update() AGORA COM TRANSAÇÃO
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    await this.findOne(id); // Verifica se existe

    // ✅ FIX 7: Validação XOR no update (adicional ao DTO)
    // Garantir que não estamos setando userId E clientName simultaneamente
    const hasUserId =
      updateAppointmentDto.userId !== undefined &&
      updateAppointmentDto.userId !== null;
    const hasClientName =
      updateAppointmentDto.clientName !== undefined &&
      updateAppointmentDto.clientName !== null;

    if (hasUserId && hasClientName) {
      throw new BadRequestException(
        'No update, forneça APENAS userId OU clientName, não ambos. Use null para remover um campo.',
      );
    }

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

        if (!newService.active) {
          throw new BadRequestException(
            `O serviço "${newService.name}" não está mais disponível para agendamento.`,
          );
        }

        service = newService;
      }

      // ✅ FIX 4: Usar dayjs para parsing
      const startsAt = updateAppointmentDto.startsAt
        ? dayjs(updateAppointmentDto.startsAt).toDate()
        : current!.startsAt;

      // Recalcular endsAt se startsAt foi alterado e endsAt não foi fornecido
      const endsAt = updateAppointmentDto.endsAt
        ? dayjs(updateAppointmentDto.endsAt).toDate()
        : updateAppointmentDto.startsAt
          ? dayjs(startsAt).add(service.durationMin, 'minutes').toDate()
          : current!.endsAt;

      if (startsAt >= endsAt) {
        const timezone = updateAppointmentDto.timezone || 'America/Sao_Paulo';
        const startsAtStr = dayjs(startsAt)
          .tz(timezone)
          .format('DD/MM/YYYY HH:mm');
        const endsAtStr = dayjs(endsAt).tz(timezone).format('DD/MM/YYYY HH:mm');
        throw new BadRequestException(
          `O horário de início (${startsAtStr}) deve ser anterior ao horário de término (${endsAtStr})`,
        );
      }

      // Obter timezone do DTO ou usar padrão
      const timezone = updateAppointmentDto.timezone || 'America/Sao_Paulo';

      // Validar horário comercial para startsAt e endsAt
      await this.validateBusinessHours(startsAt, timezone);
      await this.validateBusinessHours(endsAt, timezone);

      // Verificar se o horário está bloqueado
      const blockInfo = await this.timeBlockService.getBlockInfo(
        startsAt,
        endsAt,
      );
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
        throw new BadRequestException(
          `Este horário está bloqueado (${typeLabel}${reason})`,
        );
      }

      // ✅ FIX 5: TRANSAÇÃO COM SERIALIZABLE (CRÍTICO!)
      const appointment = await this.prisma.$transaction(
        async (tx) => {
          // Verificar conflitos DENTRO da transação (excluindo o próprio agendamento)
          const conflicts = await tx.appointment.findMany({
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
                  AND: [
                    { startsAt: { lt: endsAt } },
                    { endsAt: { gte: endsAt } },
                  ],
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
            } as Record<string, unknown>,
            include: {
              user: true,
              service: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          });

          if (conflicts.length > 0) {
            const conflict = conflicts[0];
            const conflictClient =
              conflict.user?.name || conflict.clientName || 'Outro cliente';
            const conflictTime = `${dayjs(conflict.startsAt).tz(timezone).format('HH:mm')} - ${dayjs(conflict.endsAt).tz(timezone).format('HH:mm')}`;

            throw new ConflictException(
              `Este horário não está disponível. ${conflictClient} já tem um agendamento de ${conflict.service.name} das ${conflictTime}`,
            );
          }

          // Atualizar com as datas calculadas DENTRO da transação
          return await tx.appointment.update({
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
                clientName: updateAppointmentDto.clientName?.trim(),
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
        },
        {
          isolationLevel: 'Serializable',
          maxWait: 5000,
          timeout: 10000,
        },
      );

      return new Appointment(appointment);
    }

    // Se não estiver atualizando datas, apenas atualizar outros campos
    // (sem necessidade de transação)
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
          clientName: updateAppointmentDto.clientName?.trim(),
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

    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

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
   * ✅ FIX 6: Nunca retornar slots no passado
   */
  async getAvailableSlots(
    date: string,
    serviceId: string,
  ): Promise<{
    slots: string[];
    businessHours: { openTime: string; closeTime: string };
  }> {
    const settings = await this.settingsService.get();

    // Verificar se o serviço existe e está ativo
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Serviço com ID ${serviceId} não encontrado`);
    }

    if (!service.active) {
      throw new BadRequestException(
        `O serviço "${service.name}" não está mais disponível para agendamento.`,
      );
    }

    // Converter a data para o início do dia usando dayjs
    const targetDate = dayjs(date).startOf('day');

    // Verificar se é dia útil
    const dayOfWeek = targetDate.day();
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
    const startOfDay = targetDate.toDate();
    const endOfDay = targetDate.endOf('day').toDate();

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
    const now = new Date();

    // Iterar pelos slots possíveis
    for (
      let timeInMinutes = openTimeInMinutes;
      timeInMinutes + serviceDurationMin <= closeTimeInMinutes;
      timeInMinutes += slotInterval
    ) {
      const slotHour = Math.floor(timeInMinutes / 60);
      const slotMinute = timeInMinutes % 60;

      const slotStart = targetDate
        .hour(slotHour)
        .minute(slotMinute)
        .second(0)
        .millisecond(0)
        .toDate();

      const slotEnd = dayjs(slotStart)
        .add(serviceDurationMin, 'minutes')
        .toDate();

      // ✅ FIX: SEMPRE validar que o slot não está no passado
      if (slotStart.getTime() <= now.getTime()) {
        continue; // Pular slots que já passaram
      }

      // Verificar antecedência mínima
      const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
      if (slotStart.getTime() - now.getTime() < minAdvanceMs) {
        continue;
      }

      // Verificar se o slot conflita com algum agendamento existente
      const hasConflict = existingAppointments.some((appointment) => {
        const appointmentStart = new Date(appointment.startsAt).getTime();
        const appointmentEnd = new Date(appointment.endsAt).getTime();
        const slotStartTime = slotStart.getTime();
        const slotEndTime = slotEnd.getTime();

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

  /**
   * Busca o histórico de agendamentos de um cliente por nome ou telefone
   */
  async getClientHistory(
    clientName?: string,
    phone?: string,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Appointment>> {
    const { page = 1, limit = 10 } = paginationDto || {};

    if (!clientName && !phone) {
      throw new BadRequestException(
        'É necessário fornecer pelo menos o nome ou telefone do cliente para buscar o histórico',
      );
    }

    const whereConditions: Record<string, unknown> = {
      OR: [],
    };

    if (clientName) {
      whereConditions.OR.push(
        {
          clientName: {
            contains: clientName,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: clientName,
              mode: 'insensitive',
            },
          },
        },
      );
    }

    if (phone) {
      whereConditions.OR.push({
        user: {
          phone: {
            contains: phone,
          },
        },
      });
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: whereConditions,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              durationMin: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          startsAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count({
        where: whereConditions,
      }),
    ]);

    return new PaginatedResult(appointments, total, page, limit);
  }
}
