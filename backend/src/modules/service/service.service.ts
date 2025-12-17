import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Service } from '@prisma/client';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    return await this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Service>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        skip,
        take: limit,
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.service.count({
        where: {
          active: true,
        },
      }),
    ]);

    return new PaginatedResult(services, total, page, limit);
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: {
        id,
        active: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    await this.findOne(id); // Verifica se existe e está ativo

    return await this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string): Promise<Service> {
    await this.findOne(id); // Verifica se existe e está ativo

    // Soft delete: marca como inativo ao invés de deletar
    return await this.prisma.service.update({
      where: { id },
      data: { active: false },
    });
  }
}
