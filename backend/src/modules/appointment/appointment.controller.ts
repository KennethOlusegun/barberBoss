import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAvailableSlotsDto } from './dto/get-available-slots.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';
import { Public } from '../../decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { Role } from '@prisma/client';
import dayjs from '../../config/dayjs.config';
import {
  ThrottleModerate,
  ThrottleRelaxed,
} from '../../decorators/throttle.decorator';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ThrottleModerate()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo agendamento (requer autenticação)' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    // CORREÇÃO 1: Removido "| undefined" redundante
    @CurrentUser() user?: { id: string; role: string },
  ) {
    console.log('--- [DEBUG] AppointmentController.create ---');
    console.log('DTO recebido:', JSON.stringify(createAppointmentDto, null, 2));

    if (user?.id && !createAppointmentDto.userId) {
      createAppointmentDto.userId = user.id;
    }

    const timezone = createAppointmentDto.timezone || 'America/Sao_Paulo';

    return this.appointmentService.create({
      ...createAppointmentDto,
      timezone,
    });
  }

  @Get()
  @ThrottleRelaxed()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Listar agendamentos com filtros opcionais e paginação (requer autenticação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos retornada com sucesso',
  })
  findAll(
    @Query() filter: AppointmentFilterDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    // CORREÇÃO 2: Removidos 'userId' e 'status' que não estavam sendo usados
    const { date, barberId, page, offset, limit } = filter;

    const paginationDto: PaginationDto = { limit: limit || 10 };
    if (page) {
      paginationDto.page = page;
    } else if (offset !== undefined) {
      paginationDto.page = Math.floor((offset || 0) / (limit || 10)) + 1;
    } else {
      paginationDto.page = 1;
    }

    if (date) {
      return this.appointmentService.findByDate(
        dayjs(date).toDate(),
        paginationDto,
      );
    }

    // Lógica para Barbeiro/Admin ver sua própria agenda
    if (user.role === Role.BARBER || user.role === Role.ADMIN) {
      const targetBarberId = barberId || user.id;
      return this.appointmentService.findByBarber(
        targetBarberId,
        paginationDto,
      );
    }

    // Lógica para Cliente ver seus agendamentos
    return this.appointmentService.findByUser(user.id, paginationDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar agendamento por ID (requer autenticação)' })
  @ApiParam({ name: 'id', description: 'UUID do agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.BARBER, Role.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar agendamento (ADMIN ou BARBER)' })
  @ApiParam({ name: 'id', description: 'UUID do agendamento' })
  @ApiResponse({
    status: 200,
    description: 'Agendamento atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas ADMIN ou BARBER',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user?.role === 'CLIENT') {
      return this.appointmentService.findOne(id).then((appointment) => {
        if (appointment.userId !== user.id) {
          throw new Error(
            'Você só pode cancelar/agendar seus próprios agendamentos.',
          );
        }
        return this.appointmentService.update(id, updateAppointmentDto);
      });
    }
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover agendamento (apenas ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do agendamento' })
  @ApiResponse({ status: 204, description: 'Agendamento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas ADMIN' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.remove(id);
  }

  @Get('available-slots/search')
  @Public()
  @ApiOperation({
    summary: 'Buscar horários disponíveis para agendamento',
    description:
      'Retorna lista de horários disponíveis para um serviço em uma data específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horários disponíveis',
    schema: {
      type: 'object',
      properties: {
        slots: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de horários disponíveis em formato ISO 8601',
        },
        businessHours: {
          type: 'object',
          properties: {
            openTime: { type: 'string', example: '08:00' },
            closeTime: { type: 'string', example: '18:00' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Data ou serviço inválido' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async getAvailableSlots(@Query() query: GetAvailableSlotsDto) {
    return this.appointmentService.getAvailableSlots(
      query.date,
      query.serviceId,
    );
  }

  @Get('client-history')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN, Role.BARBER)
  @ApiOperation({
    summary:
      'Buscar histórico de agendamentos de um cliente por nome ou telefone',
    description: 'Retorna o histórico paginado...',
  })
  @ApiQuery({ name: 'clientName', required: false })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getClientHistory(
    @Query('clientName') clientName?: string,
    @Query('phone') phone?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.appointmentService.getClientHistory(
      clientName,
      phone,
      paginationDto,
    );
  }
}
