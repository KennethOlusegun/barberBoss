import {
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlockType } from '@prisma/client';

export class CreateTimeBlockDto {
  @ApiPropertyOptional({
    enum: BlockType,
    description: 'Tipo do bloqueio',
    example: 'LUNCH',
  })
  @IsEnum(BlockType, {
    message:
      'type deve ser um valor válido: LUNCH, BREAK, DAY_OFF, VACATION, CUSTOM',
  })
  @IsOptional()
  type?: BlockType;

  @ApiPropertyOptional({
    description: 'Motivo do bloqueio',
    example: 'Horário de almoço',
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: 'reason deve ser uma string' })
  @MinLength(2, { message: 'reason deve ter no mínimo 2 caracteres' })
  @MaxLength(200, { message: 'reason deve ter no máximo 200 caracteres' })
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Data e hora de início do bloqueio',
    example: '2025-01-10T12:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'startsAt deve ser uma data válida no formato ISO 8601' },
  )
  startsAt: string;

  @ApiProperty({
    description: 'Data e hora de término do bloqueio',
    example: '2025-01-10T13:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'endsAt deve ser uma data válida no formato ISO 8601' },
  )
  endsAt: string;

  @ApiPropertyOptional({
    description: 'Se o bloqueio é recorrente (repete em dias específicos)',
    example: true,
  })
  @IsBoolean({ message: 'isRecurring deve ser um booleano' })
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description:
      'Dias da semana para bloqueios recorrentes (0=Domingo, 6=Sábado)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsArray({ message: 'recurringDays deve ser um array' })
  @IsInt({ each: true, message: 'Cada dia deve ser um número inteiro' })
  @Min(0, { each: true, message: 'Dias devem estar entre 0 e 6' })
  @Max(6, { each: true, message: 'Dias devem estar entre 0 e 6' })
  @IsOptional()
  recurringDays?: number[];
}
