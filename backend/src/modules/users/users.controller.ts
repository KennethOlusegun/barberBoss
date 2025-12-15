import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Get,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBER)
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<{ message: string; user: User }> {
    const user = await this.usersService.updateRole(id, dto.role);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { message: 'Role atualizada com sucesso', user };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBER)
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<User[]> {
    // Sempre retorna apenas CLIENTS para o barbeiro
    return this.usersService.findAll('CLIENT', limit, offset);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBER)
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBER)
  async create(@Body() dto: CreateUserDto): Promise<User> {
    // Só permite criar CLIENTS se for BARBER
    if (dto.role && dto.role !== 'CLIENT') {
      throw new NotFoundException('Barbeiro só pode criar clientes');
    }
    dto.role = 'CLIENT';
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBER)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    // Só permite atualizar CLIENTS se for BARBER
    if (dto.role && dto.role !== 'CLIENT') {
      throw new NotFoundException('Barbeiro só pode atualizar clientes');
    }
    return this.usersService.update(id, { ...dto, role: 'CLIENT' });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBER)
  async remove(@Param('id') id: string): Promise<User> {
    // Só permite deletar CLIENTS se for BARBER
    const user = await this.usersService.findOne(id);
    if (!user || user.role !== 'CLIENT') {
      throw new NotFoundException('Barbeiro só pode deletar clientes');
    }
    return this.usersService.remove(id);
  }
}
