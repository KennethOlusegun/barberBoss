import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './entities/user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return new User(user);
  }

  async findAll(
    paginationDto?: PaginationDto,
    filterDto?: { role?: string },
  ): Promise<PaginatedResult<User>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filterDto?.role) {
      where.role = filterDto.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    const userEntities = users.map((user) => new User(user));
    return new PaginatedResult(userEntities, total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return new User(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? new User(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Se estiver atualizando o email, verificar conflito
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Se estiver atualizando a senha, fazer hash
    const data = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return new User(user);
  }

  async remove(id: string): Promise<void> {
    // Verificar se o usuário existe
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
