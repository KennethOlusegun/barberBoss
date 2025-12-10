import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetClientHistoryDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Nome do cliente para buscar histórico (busca parcial, case-insensitive)',
    example: 'João Silva',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres' })
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Telefone do cliente para buscar histórico',
    example: '11987654321',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'O telefone deve ter pelo menos 10 dígitos' })
  phone?: string;
}
