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
import { Public } from '../../decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { Role } from '@prisma/client';
import dayjs from '../../config/dayjs.config';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo agendamento (requer autenticação)' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user?: any,
  ) {
    // Se o usuário está autenticado e não forneceu userId, usar o ID do usuário logado
    if (user?.id && !createAppointmentDto.userId) {
      createAppointmentDto.userId = user.id;
    }

    // Definir timezone padrão se não fornecido
    const timezone = createAppointmentDto.timezone || 'America/Sao_Paulo';

    // Converter horário local para UTC
    const startsAtLocal = dayjs.tz(createAppointmentDto.startsAt, timezone);
    const startsAtUTC = startsAtLocal.utc().toISOString();

    // Criar DTO com horário UTC
    const dtoWithUTC = {
      ...createAppointmentDto,
      startsAt: startsAtUTC,
      timezone, // Manter timezone para validações
    };

    return this.appointmentService.create(dtoWithUTC);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar agendamentos com filtros opcionais e paginação (requer autenticação)',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filtrar por data (ISO 8601)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por UUID do usuário',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 10, máx: 100)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos retornada com sucesso',
  })
  findAll(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    // Se fornecida uma data específica, buscar por data
    if (date) {
      return this.appointmentService.findByDate(new Date(date), paginationDto);
    }

    // Se fornecido um userId, buscar por usuário
    if (userId) {
      return this.appointmentService.findByUser(userId, paginationDto);
    }

    // Se fornecido um status, buscar por status
    if (status) {
      return this.appointmentService.findByStatus(status, paginationDto);
    }

    // Caso contrário, retornar todos
    return this.appointmentService.findAll(paginationDto);
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
  @Roles(Role.ADMIN, Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar agendamento (ADMIN ou BARBER)' })
  @ApiParam({ name: 'id', description: 'UUID do agendamento' })
  @ApiResponse({
    status: 200,
    description: 'Agendamento atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas ADMIN ou BARBER' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
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
  @Public() // Endpoint público para clientes consultarem disponibilidade
  @ApiOperation({
    summary: 'Buscar horários disponíveis para agendamento',
    description:
      'Retorna lista de horários disponíveis para um serviço em uma data específica',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Data para buscar horários (ISO 8601)',
    example: '2025-12-10',
  })
  @ApiQuery({
    name: 'serviceId',
    required: true,
    description: 'UUID do serviço',
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
  async getAvailableSlots(
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.appointmentService.getAvailableSlots(date, serviceId);
  }
}
