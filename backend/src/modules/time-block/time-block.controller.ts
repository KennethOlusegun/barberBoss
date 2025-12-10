import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TimeBlockService } from './time-block.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('time-blocks')
@Controller('time-blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeBlockController {
  constructor(private readonly timeBlockService: TimeBlockService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar bloqueio de horário' })
  @ApiResponse({ status: 201, description: 'Bloqueio criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas ADMIN)' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTimeBlockDto: CreateTimeBlockDto) {
    return this.timeBlockService.create(createTimeBlockDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar todos os bloqueios ativos' })
  @ApiResponse({ status: 200, description: 'Lista de bloqueios retornada' })
  findAll() {
    return this.timeBlockService.findAll();
  }

  @Get('range')
  @Public()
  @ApiOperation({ summary: 'Buscar bloqueios por período' })
  @ApiQuery({ name: 'startDate', example: '2025-01-10T08:00:00.000Z' })
  @ApiQuery({ name: 'endDate', example: '2025-01-10T18:00:00.000Z' })
  @ApiResponse({ status: 200, description: 'Bloqueios no período retornados' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.timeBlockService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar bloqueio por ID' })
  @ApiResponse({ status: 200, description: 'Bloqueio encontrado' })
  @ApiResponse({ status: 404, description: 'Bloqueio não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeBlockService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar bloqueio de horário' })
  @ApiResponse({ status: 200, description: 'Bloqueio atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas ADMIN)' })
  @ApiResponse({ status: 404, description: 'Bloqueio não encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTimeBlockDto: UpdateTimeBlockDto,
  ) {
    return this.timeBlockService.update(id, updateTimeBlockDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remover bloqueio de horário (soft delete)' })
  @ApiResponse({ status: 204, description: 'Bloqueio removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas ADMIN)' })
  @ApiResponse({ status: 404, description: 'Bloqueio não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeBlockService.remove(id);
  }
}
