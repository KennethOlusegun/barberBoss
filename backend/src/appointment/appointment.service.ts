import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Validar que pelo menos userId ou clientName foi fornecido
    if (!createAppointmentDto.userId && !createAppointmentDto.clientName) {
      throw new BadRequestException(
        'É necessário fornecer userId ou clientName'
      );
    }

    // Verificar se o serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: createAppointmentDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(
        `Serviço com ID ${createAppointmentDto.serviceId} não encontrado`
      );
    }

    // Calcular endsAt automaticamente baseado na duração do serviço
    const startsAt = new Date(createAppointmentDto.startsAt);
    const endsAt = createAppointmentDto.endsAt 
      ? new Date(createAppointmentDto.endsAt)
      : new Date(startsAt.getTime() + service.durationMin * 60000); // Adiciona duração em milissegundos
    
    // Validar que startsAt é antes de endsAt
    if (startsAt >= endsAt) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término'
      );
    }

    // Verificar se o usuário existe (se fornecido)
    if (createAppointmentDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createAppointmentDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuário com ID ${createAppointmentDto.userId} não encontrado`
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
        createdAt: 'asc', // Mostrar o mais antigo primeiro
      },
    });

    if (conflicts.length > 0) {
      // Retorna o agendamento mais antigo que está causando o conflito
      const conflict = conflicts[0];
      const conflictClient = conflict.user?.name || conflict.clientName || 'Outro cliente';
      const conflictTime = `${conflict.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${conflict.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      
      throw new ConflictException(
        `Este horário não está disponível. ${conflictClient} já tem um agendamento de ${conflict.service.name} das ${conflictTime}`
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

  async findAll(): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        user: true,
        service: true,
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return appointments.map(appointment => new Appointment(appointment));
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
    if (updateAppointmentDto.startsAt || updateAppointmentDto.endsAt || updateAppointmentDto.serviceId) {
      const current = await this.prisma.appointment.findUnique({
        where: { id },
        include: { service: true },
      });

      // Se o serviço foi alterado, buscar o novo serviço
      let service = current!.service;
      if (updateAppointmentDto.serviceId && updateAppointmentDto.serviceId !== current!.serviceId) {
        const newService = await this.prisma.service.findUnique({
          where: { id: updateAppointmentDto.serviceId },
        });
        
        if (!newService) {
          throw new NotFoundException(
            `Serviço com ID ${updateAppointmentDto.serviceId} não encontrado`
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
          'A data de início deve ser anterior à data de término'
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
          service: true,
        },
        orderBy: {
          createdAt: 'asc', // Mostrar o mais antigo primeiro
        },
      });

      if (conflicts.length > 0) {
        // Retorna o agendamento mais antigo que está causando o conflito
        const conflict = conflicts[0];
        const conflictClient = conflict.user?.name || conflict.clientName || 'Outro cliente';
        const conflictTime = `${conflict.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${conflict.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        
        throw new ConflictException(
          `Este horário não está disponível. ${conflictClient} já tem um agendamento de ${conflict.service.name} das ${conflictTime}`
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

  async findByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
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
    });

    return appointments.map(appointment => new Appointment(appointment));
  }

  async findByUser(userId: string): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { userId },
      include: {
        user: true,
        service: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    });

    return appointments.map(appointment => new Appointment(appointment));
  }

  async findByStatus(status: string): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { status: status as any },
      include: {
        user: true,
        service: true,
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return appointments.map(appointment => new Appointment(appointment));
  }
}
