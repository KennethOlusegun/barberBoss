import { IsString, IsDateString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsUUID()
  serviceId: string;
}
