import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Get,
  Query,
  Post,
  Delete,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER') // ✅ MUDOU: use strings diretas
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
  @Roles('ADMIN', 'BARBER') // ✅ MUDOU: use strings diretas
  async findAll(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('role') role?: string, // ✅ ADICIONADO: role como query param
  ): Promise<User[]> {
    console.log('[USERS] Listagem requisitada');
    if (req && req.user) {
      console.log('[USERS] Usuário autenticado:', req.user);
    }
    console.log('[USERS] Query params:', { limit, offset, role });

    // ✅ Usa o role da query ou default CLIENT
    return this.usersService.findAll(role || 'CLIENT', limit, offset);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER') // ✅ MUDOU: use strings diretas
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER') // ✅ MUDOU: use strings diretas
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
  @Roles('ADMIN', 'BARBER') // ✅ MUDOU: use strings diretas
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    // Só permite atualizar CLIENTS se for BARBER
    if (dto.role && dto.role !== 'CLIENT') {
      throw new NotFoundException('Barbeiro só pode atualizar clientes');
    }
    return this.usersService.update(id, { ...dto, role: 'CLIENT' });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER') // ✅ MUDOU: use strings diretas
  async remove(@Param('id') id: string): Promise<User> {
    // Só permite deletar CLIENTS se for BARBER
    const user = await this.usersService.findOne(id);
    if (!user || user.role !== 'CLIENT') {
      throw new NotFoundException('Barbeiro só pode deletar clientes');
    }
    return this.usersService.remove(id);
  }
}
