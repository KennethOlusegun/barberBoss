import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeBlock } from './entities/time-block.entity';

@Injectable()
export class TimeBlockService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTimeBlockDto: CreateTimeBlockDto): Promise<TimeBlock> {
    const startsAt = new Date(createTimeBlockDto.startsAt);
    const endsAt = new Date(createTimeBlockDto.endsAt);

    // Validar que startsAt é antes de endsAt
    if (startsAt >= endsAt) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término',
      );
    }

    // Validar dias recorrentes se isRecurring for true
    if (
      createTimeBlockDto.isRecurring &&
      (!createTimeBlockDto.recurringDays ||
        createTimeBlockDto.recurringDays.length === 0)
    ) {
      throw new BadRequestException(
        'recurringDays é obrigatório quando isRecurring é true',
      );
    }

    const timeBlock = await this.prisma.timeBlock.create({
      data: {
        type: createTimeBlockDto.type ?? 'CUSTOM',
        reason: createTimeBlockDto.reason,
        startsAt,
        endsAt,
        isRecurring: createTimeBlockDto.isRecurring ?? false,
        recurringDays: createTimeBlockDto.recurringDays ?? [],
      },
    });

    return new TimeBlock(timeBlock);
  }

  async findAll(): Promise<TimeBlock[]> {
    const timeBlocks = await this.prisma.timeBlock.findMany({
      where: { active: true } as Record<string, unknown>,
      orderBy: { startsAt: 'asc' },
    });

    return timeBlocks.map((block) => new TimeBlock(block));
  }

  async findOne(id: string): Promise<TimeBlock> {
    const timeBlock = await this.prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!timeBlock || !timeBlock.active) {
      throw new NotFoundException('Bloqueio de horário não encontrado');
    }

    return new TimeBlock(timeBlock);
  }

  async findByDateRange(start: Date, end: Date): Promise<TimeBlock[]> {
    const where: Record<string, unknown> = {
      active: true,
      OR: [
        {
          // Bloqueio começa dentro do intervalo
          startsAt: {
            gte: start,
            lt: end,
          },
        },
        {
          // Bloqueio termina dentro do intervalo
          endsAt: {
            gt: start,
            lte: end,
          },
        },
        {
          // Bloqueio engloba todo o intervalo
          AND: [
            {
              startsAt: {
                lte: start,
              },
            },
            {
              endsAt: {
                gte: end,
              },
            },
          ],
        },
      ],
    };
    const timeBlocks = await this.prisma.timeBlock.findMany({
      where,
      orderBy: { startsAt: 'asc' },
    });

    return timeBlocks.map((block) => new TimeBlock(block));
  }

  /**
   * Verifica se um horário está bloqueado
   */
  async isBlocked(startsAt: Date, endsAt: Date): Promise<boolean> {
    const dayOfWeek = startsAt.getDay();

    const where: Record<string, unknown> = {
      active: true,
      OR: [
        {
          // Bloqueio específico que sobrepõe
          AND: [
            { isRecurring: false },
            {
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
            },
          ],
        },
        {
          // Bloqueio recorrente no dia da semana
          AND: [{ isRecurring: true }, { recurringDays: { has: dayOfWeek } }],
        },
      ],
    };
    const blocks = await this.prisma.timeBlock.findMany({ where });

    // Para bloqueios recorrentes, verificar se o horário do dia conflita
    for (const block of blocks) {
      if (
        block.isRecurring &&
        Array.isArray(block.recurringDays) &&
        block.recurringDays.includes(dayOfWeek)
      ) {
        const blockStart = new Date(block.startsAt);
        const blockEnd = new Date(block.endsAt);

        // Extrair apenas hora e minuto
        const blockStartTime =
          blockStart.getHours() * 60 + blockStart.getMinutes();
        const blockEndTime = blockEnd.getHours() * 60 + blockEnd.getMinutes();

        const startsAtTime = startsAt.getHours() * 60 + startsAt.getMinutes();
        const endsAtTime = endsAt.getHours() * 60 + endsAt.getMinutes();

        // Verificar sobreposição de horários
        if (
          (startsAtTime >= blockStartTime && startsAtTime < blockEndTime) ||
          (endsAtTime > blockStartTime && endsAtTime <= blockEndTime) ||
          (startsAtTime <= blockStartTime && endsAtTime >= blockEndTime)
        ) {
          return true;
        }
      } else {
        // Para bloqueios não recorrentes, já encontrou conflito na query
        return true;
      }
    }

    return false;
  }

  /**
   * Retorna informações detalhadas do bloqueio se houver conflito
   */
  async getBlockInfo(startsAt: Date, endsAt: Date): Promise<TimeBlock | null> {
    const dayOfWeek = startsAt.getDay();

    const where: Record<string, unknown> = {
      active: true,
      OR: [
        {
          // Bloqueio específico que sobrepõe
          AND: [
            { isRecurring: false },
            {
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
            },
          ],
        },
        {
          // Bloqueio recorrente no dia da semana
          AND: [{ isRecurring: true }, { recurringDays: { has: dayOfWeek } }],
        },
      ],
    };
    const blocks = await this.prisma.timeBlock.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Para bloqueios recorrentes, verificar se o horário do dia conflita
    for (const block of blocks) {
      if (
        block.isRecurring &&
        Array.isArray(block.recurringDays) &&
        block.recurringDays.includes(dayOfWeek)
      ) {
        const blockStart = new Date(block.startsAt);
        const blockEnd = new Date(block.endsAt);

        // Extrair apenas hora e minuto
        const blockStartTime =
          blockStart.getHours() * 60 + blockStart.getMinutes();
        const blockEndTime = blockEnd.getHours() * 60 + blockEnd.getMinutes();

        const startsAtTime = startsAt.getHours() * 60 + startsAt.getMinutes();
        const endsAtTime = endsAt.getHours() * 60 + endsAt.getMinutes();

        // Verificar sobreposição de horários
        if (
          (startsAtTime >= blockStartTime && startsAtTime < blockEndTime) ||
          (endsAtTime > blockStartTime && endsAtTime <= blockEndTime) ||
          (startsAtTime <= blockStartTime && endsAtTime >= blockEndTime)
        ) {
          return new TimeBlock(block);
        }
      } else if (blocks.length > 0) {
        // Para bloqueios não recorrentes, já encontrou conflito na query
        return new TimeBlock(block);
      }
    }

    return null;
  }

  async update(
    id: string,
    updateTimeBlockDto: UpdateTimeBlockDto,
  ): Promise<TimeBlock> {
    await this.findOne(id); // Verifica se existe

    // Validar datas se fornecidas
    if (updateTimeBlockDto.startsAt || updateTimeBlockDto.endsAt) {
      const current = await this.prisma.timeBlock.findUnique({
        where: { id },
      });

      if (!current) {
        throw new NotFoundException('Bloqueio de horário não encontrado');
      }

      const startsAt = updateTimeBlockDto.startsAt
        ? new Date(updateTimeBlockDto.startsAt)
        : current.startsAt;
      const endsAt = updateTimeBlockDto.endsAt
        ? new Date(updateTimeBlockDto.endsAt)
        : current.endsAt;

      if (startsAt >= endsAt) {
        throw new BadRequestException(
          'A data de início deve ser anterior à data de término',
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (updateTimeBlockDto.type) {
      updateData.type = updateTimeBlockDto.type;
    }
    if (updateTimeBlockDto.reason !== undefined) {
      updateData.reason = updateTimeBlockDto.reason;
    }
    if (updateTimeBlockDto.startsAt) {
      updateData.startsAt = new Date(updateTimeBlockDto.startsAt);
    }
    if (updateTimeBlockDto.endsAt) {
      updateData.endsAt = new Date(updateTimeBlockDto.endsAt);
    }
    if (updateTimeBlockDto.isRecurring !== undefined) {
      updateData.isRecurring = updateTimeBlockDto.isRecurring;
    }
    if (updateTimeBlockDto.recurringDays) {
      updateData.recurringDays = updateTimeBlockDto.recurringDays;
    }
    if (updateTimeBlockDto.active !== undefined) {
      updateData.active = updateTimeBlockDto.active;
    }

    const timeBlock = await this.prisma.timeBlock.update({
      where: { id },
      data: updateData,
    });

    return new TimeBlock(timeBlock);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    // Soft delete
    await this.prisma.timeBlock.update({
      where: { id },
      data: { active: false },
    });
  }
}
