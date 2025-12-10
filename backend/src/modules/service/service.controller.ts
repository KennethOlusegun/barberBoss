import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../../decorators/public.decorator';
import {
  ThrottleModerate,
  ThrottleRelaxed,
} from '../../decorators/throttle.decorator';

@ApiTags('services')
@Controller('services')
@UseGuards(RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ThrottleModerate()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo serviço (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas ADMIN' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ThrottleRelaxed()
  @Public()
  @ApiOperation({ summary: 'Listar todos os serviços com paginação (público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços retornada com sucesso',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.serviceService.findAll(paginationDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar serviço por ID (público)' })
  @ApiParam({ name: 'id', description: 'UUID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar serviço (apenas ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas ADMIN' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover serviço (apenas ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do serviço' })
  @ApiResponse({ status: 204, description: 'Serviço removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
