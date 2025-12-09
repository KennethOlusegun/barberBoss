import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Nome do serviço', example: 'Corte de cabelo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição do serviço',
    example: 'Corte masculino tradicional',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Preço do serviço', example: 50.0, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Duração do serviço em minutos',
    example: 30,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationMin: number;
}
