import {
  IsOptional,
  IsUUID,
  IsString,
  IsISO8601,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentFilterDto {
  @IsOptional()
  @IsUUID('4', { message: 'userId deve ser um UUID válido (formato v4)' })
  userId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'barberId deve ser um UUID válido (formato v4)' })
  barberId?: string;

  @IsOptional()
  @IsISO8601(
    { strict: true },
    { message: 'date deve estar no formato ISO 8601' },
  )
  date?: string;

  @IsOptional()
  @IsString({ message: 'status deve ser uma string' })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
