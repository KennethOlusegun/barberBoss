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
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly timeBlockService: TimeBlockService,
  ) {}

  /**
   * Parse uma data de agendamento respeitando timezone e offset
   * @param dateInput - String ISO, Date object ou string sem timezone
   * @param timezone - Timezone de referência (ex: 'America/Sao_Paulo')
   * @returns Date em UTC pronto para persistir no banco
   */
  private parseAppointmentDate(
    dateInput: string | Date,
    timezone: string,
  ): Date {
    if (dateInput instanceof Date) {
      console.log('🔍 parseAppointmentDate: input é Date, retorna direto', {
        input: dateInput.toISOString(),
        timezone,
      });
      return dateInput;
    }

    const dateStr = dateInput.trim();
    // Detecta offset no final da string (ex: -03:00, +05:30, Z)
    const hasOffset = /[+-]\d{2}:\d{2}$|Z$/.test(dateStr);

    console.log('🔍 parseAppointmentDate:', {
      input: dateStr,
      hasOffset,
      timezone,
    });

    let parsed: Date;

    if (hasOffset) {
      // String tem offset: parse direto mantendo momento absoluto
      parsed = dayjs(dateStr).toDate();
      console.log('✅ Parsed with offset → UTC:', parsed.toISOString());
    } else {
      // String sem offset: interpretar no timezone especificado
      parsed = dayjs.tz(dateStr, timezone).toDate();
      console.log('✅ Parsed in timezone → UTC:', parsed.toISOString());
    }

    return parsed;
  }

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

    console.log('--- [DEBUG] validateBusinessHours ---');
    console.log('date (UTC):', date.toISOString());

    // Conversão direta: date já está em UTC do banco
    const dateInTimezone = dayjs(date).tz(timezone);
    console.log('🕐 validateBusinessHours:', {
      input_utc: date.toISOString(),
      timezone: timezone,
      local_time: dateInTimezone.format('YYYY-MM-DD HH:mm:ss'),
      day_of_week: dateInTimezone.day(),
      hour: dateInTimezone.hour(),
      minute: dateInTimezone.minute(),
    });

    const day = dateInTimezone.day();
    console.log(
      'day (0=Domingo):',
      day,
      '| Nome:',
      this.settingsService.getDayName(day),
    );
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

  /**
   * Busca agendamentos com filtros avançados, incluindo commissionPaid
   */
  async findAllWithFilters(filter: any, user: { id: string; role: string }) {
    const {
      date,
      barberId,
      userId,
      status,
      commissionPaid,
      page,
      offset,
      limit,
    } = filter;
    const paginationDto: PaginationDto = { limit: limit || 10 };
    if (page) {
      paginationDto.page = page;
    } else if (offset !== undefined) {
      paginationDto.page = Math.floor((offset || 0) / (limit || 10)) + 1;
    } else {
      paginationDto.page = 1;
    }

    const where: any = {};
    if (date) {
      const d = dayjs(date);
      where.startsAt = {
        gte: d.startOf('day').toDate(),
        lte: d.endOf('day').toDate(),
      };
    }
    if (barberId) where.barberId = barberId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (commissionPaid !== undefined)
      where.commissionPaid =
        commissionPaid === 'true' || commissionPaid === true;

    // Permissões: admin/barber veem por barberId, client por userId
    if (user.role === 'BARBER' || user.role === 'ADMIN') {
      if (!barberId) where.barberId = user.id;
    } else {
      where.userId = user.id;
    }

    const pageNum = paginationDto.page || 1;
    const lim = paginationDto.limit || 10;
    const skip = (pageNum - 1) * lim;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: lim,
        where,
        include: { user: true, service: true },
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);
    const appointmentEntities = appointments.map(
      (appointment) => new Appointment(appointment),
    );
    return new PaginatedResult(appointmentEntities, total, pageNum, lim);
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    console.log('--- [DEBUG] AppointmentService.create ---');
    console.log(
      'Payload recebido:',
      JSON.stringify(createAppointmentDto, null, 2),
    );

    // Validação XOR entre userId e clientName
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

    const timezone = createAppointmentDto.timezone || 'America/Sao_Paulo';
    const startsAt = this.parseAppointmentDate(
      createAppointmentDto.startsAt,
      timezone,
    );
    const endsAt = createAppointmentDto.endsAt
      ? this.parseAppointmentDate(createAppointmentDto.endsAt, timezone)
      : dayjs(startsAt).add(service.durationMin, 'minutes').toDate();

    if (startsAt >= endsAt) {
      const startsAtStr = dayjs(startsAt)
        .tz(timezone)
        .format('DD/MM/YYYY HH:mm');
      const endsAtStr = dayjs(endsAt).tz(timezone).format('DD/MM/YYYY HH:mm');
      throw new BadRequestException(
        `O horário de início (${startsAtStr}) deve ser anterior ao horário de término (${endsAtStr})`,
      );
    }

    await this.validateBusinessHours(startsAt, timezone);
    await this.validateBusinessHours(endsAt, timezone);

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

    const appointment = await this.prisma.$transaction(
      async (tx) => {
        const conflicts = await tx.appointment.findMany({
          where: {
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
          },
          include: {
            user: true,
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

          // Buscar nome do serviço pelo serviceId
          const conflictService = await this.prisma.service.findUnique({
            where: { id: conflict.serviceId },
          });
          const conflictServiceName = conflictService?.name || 'Serviço';

          throw new ConflictException(
            `Este horário já está reservado. ${conflictClient} tem um agendamento para "${conflictServiceName}" no dia ${conflictDate} das ${conflictStartTime} às ${conflictEndTime}. Por favor, escolha outro horário disponível.`,
          );
        }


        // Garantir que price seja numérico e não nulo, usando o service já buscado no início
        const servicePrice = service.price 
          ? (typeof service.price === 'string' ? parseFloat(service.price) : Number(service.price))
          : 0;

        const COMMISSION_RATE = 0.5;
        const commissionValue = servicePrice * COMMISSION_RATE;

        console.log('💰 [CREATE] Valores calculados:', {
          servicePrice,
          commissionValue,
          servicePriceOriginal: service.price,
          servicePriceType: typeof service.price,
          serviceId: service.id
        });

        return await tx.appointment.create({
          data: {
            startsAt,
            endsAt,
            status: createAppointmentDto.status || 'CONFIRMED',
            clientName: createAppointmentDto.clientName?.trim(),
            commissionPaid:
              typeof createAppointmentDto.commissionPaid === 'boolean'
                ? createAppointmentDto.commissionPaid
                : false,
            // Conversão explícita para Decimal
            price: new Prisma.Decimal(servicePrice),
            commission: new Prisma.Decimal(commissionValue),
            service: { connect: { id: createAppointmentDto.serviceId } },
            ...(createAppointmentDto.userId && {
              user: { connect: { id: createAppointmentDto.userId } },
            }),
            ...(createAppointmentDto.barberId && {
              barber: { connect: { id: createAppointmentDto.barberId } },
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
    await this.findOne(id);

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

    if (
      updateAppointmentDto.startsAt ||
      updateAppointmentDto.endsAt ||
      updateAppointmentDto.serviceId
    ) {
      const current = await this.prisma.appointment.findUnique({
        where: { id },
        include: { service: true },
      });

      const timezone = updateAppointmentDto.timezone || 'America/Sao_Paulo';
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

      const startsAt = updateAppointmentDto.startsAt
        ? this.parseAppointmentDate(updateAppointmentDto.startsAt, timezone)
        : current!.startsAt;

      const endsAt = updateAppointmentDto.endsAt
        ? this.parseAppointmentDate(updateAppointmentDto.endsAt, timezone)
        : updateAppointmentDto.startsAt
          ? dayjs(startsAt).add(service.durationMin, 'minutes').toDate()
          : current!.endsAt;

      if (startsAt >= endsAt) {
        const startsAtStr = dayjs(startsAt)
          .tz(timezone)
          .format('DD/MM/YYYY HH:mm');
        const endsAtStr = dayjs(endsAt).tz(timezone).format('DD/MM/YYYY HH:mm');
        throw new BadRequestException(
          `O horário de início (${startsAtStr}) deve ser anterior ao horário de término (${endsAtStr})`,
        );
      }

      await this.validateBusinessHours(startsAt, timezone);
      await this.validateBusinessHours(endsAt, timezone);

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

      // Buscar o service correto do banco antes de calcular a comissão
      let commissionValue: Prisma.Decimal | undefined = undefined;
      if (updateAppointmentDto.status === 'COMPLETED') {
        // Garante que sempre pega o serviceId atualizado
        const serviceIdToUse = updateAppointmentDto.serviceId || current!.serviceId;
        const serviceForCommission = await this.prisma.service.findUnique({
          where: { id: serviceIdToUse },
        });
        if (!serviceForCommission) {
          throw new NotFoundException('Serviço não encontrado para cálculo de comissão');
        }
        const servicePrice = serviceForCommission.price
          ? (typeof serviceForCommission.price === 'string' ? parseFloat(serviceForCommission.price) : Number(serviceForCommission.price))
          : 0;
        const COMMISSION_RATE = 0.5;
        const calculatedCommission = servicePrice * COMMISSION_RATE;
        console.log('💰 Update - Valores calculados:', {
          servicePrice,
          calculatedCommission,
          servicePriceOriginal: serviceForCommission.price,
        });
        commissionValue = new Prisma.Decimal(calculatedCommission);
      }

      const appointment = await this.prisma.$transaction(
        async (tx) => {
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

          // commissionPaid só é alterado se vier explicitamente no DTO
          const commissionPaidAuto = updateAppointmentDto.commissionPaid;

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
              ...(commissionPaidAuto !== undefined && {
                commissionPaid: commissionPaidAuto,
              }),
              ...(commissionValue !== undefined && {
                commission: commissionValue,
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

    // commissionPaid só é alterado se vier explicitamente no DTO
    const commissionPaidAuto = updateAppointmentDto.commissionPaid;
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
        ...(commissionPaidAuto !== undefined && {
          commissionPaid: commissionPaidAuto,
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
    await this.findOne(id);

    const appointment = await this.prisma.appointment.delete({
      where: { id },
    });

    return new Appointment(appointment);
  }

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

  async findByBarber(
    barberId: string,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Appointment>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        where: { barberId },
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          startsAt: 'desc',
        },
      }),
      this.prisma.appointment.count({
        where: { barberId },
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

  async getAvailableSlots(
    date: string,
    serviceId: string,
  ): Promise<{
    slots: string[];
    businessHours: { openTime: string; closeTime: string };
  }> {
    const settings = await this.settingsService.get();

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

    const targetDate = dayjs(date).startOf('day');
    const dayOfWeek = targetDate.day();

    if (!settings.workingDays.includes(dayOfWeek)) {
      const dayName = this.settingsService.getDayName(dayOfWeek);
      throw new BadRequestException(
        `${dayName} não é um dia útil. Dias de funcionamento: ${settings.workingDays.map((d) => this.settingsService.getDayName(d)).join(', ')}`,
      );
    }

    const [openHour, openMin] = settings.openTime.split(':').map(Number);
    const [closeHour, closeMin] = settings.closeTime.split(':').map(Number);

    const openTimeInMinutes = openHour * 60 + openMin;
    const closeTimeInMinutes = closeHour * 60 + closeMin;

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

    const availableSlots: string[] = [];
    const serviceDurationMin = service.durationMin;
    const slotInterval = settings.slotIntervalMin;
    const now = new Date();

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

      if (slotStart.getTime() <= now.getTime()) {
        continue;
      }

      const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
      if (slotStart.getTime() - now.getTime() < minAdvanceMs) {
        continue;
      }

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

    const whereConditions: { OR: any[] } = {
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
          service: true,
          user: true,
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

    const appointmentEntities = appointments.map(
      (appointment) => new Appointment(appointment),
    );
    return new PaginatedResult(appointmentEntities, total, page, limit);
  }

  /**
   * Marca todas as comissões do barbeiro como pagas
   */
  async markCommissionsAsPaid(barberId: string): Promise<{ updated: number }> {
    const result = await this.prisma.appointment.updateMany({
      where: {
        barberId,
        commissionPaid: false,
      },
      data: {
        commissionPaid: true,
      },
    });
    return { updated: result.count };
  }
}
