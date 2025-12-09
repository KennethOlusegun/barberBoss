import {
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNotEmpty,
  ValidateIf,
  MinLength,
  MaxLength,
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';
import { IsBusinessHours } from '../../../decorators/is-business-hours.decorator';

export class CreateAppointmentDto {
  @IsDateString(
    {},
    { message: 'startsAt deve ser uma data válida no formato ISO 8601' },
  )
  @IsNotEmpty({ message: 'startsAt é obrigatório' })
  @IsBusinessHours({
    startHour: 8,
    endHour: 18,
    workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  })
  startsAt: string;

  @IsDateString(
    {},
    { message: 'endsAt deve ser uma data válida no formato ISO 8601' },
  )
  @IsOptional() // Agora é opcional - será calculado automaticamente se não fornecido
  endsAt?: string;

  @IsEnum(AppointmentStatus, {
    message:
      'status deve ser um valor válido: PENDING, CONFIRMED, CANCELED, COMPLETED, NO_SHOW',
  })
  @IsOptional()
  status?: AppointmentStatus;

  @IsUUID('4', { message: 'userId deve ser um UUID válido' })
  @IsOptional()
  @ValidateIf((o) => !o.clientName) // Exige userId se clientName não for fornecido
  userId?: string;

  @IsString({ message: 'clientName deve ser uma string' })
  @MinLength(2, { message: 'clientName deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'clientName deve ter no máximo 100 caracteres' })
  @IsOptional()
  @ValidateIf((o) => !o.userId) // Exige clientName se userId não for fornecido
  clientName?: string;

  @IsUUID('4', { message: 'serviceId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'serviceId é obrigatório' })
  serviceId: string;
}
