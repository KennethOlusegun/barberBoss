import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateSettingsDto {
  @IsString({ message: 'businessName deve ser uma string' })
  @MinLength(2, { message: 'businessName deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'businessName deve ter no máximo 100 caracteres' })
  @IsOptional()
  businessName?: string;

  @IsString({ message: 'openTime deve ser uma string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openTime deve estar no formato HH:mm (ex: 08:00)',
  })
  @IsOptional()
  openTime?: string;

  @IsString({ message: 'closeTime deve ser uma string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closeTime deve estar no formato HH:mm (ex: 18:00)',
  })
  @IsOptional()
  closeTime?: string;

  @IsArray({ message: 'workingDays deve ser um array' })
  @ArrayMinSize(1, { message: 'workingDays deve ter pelo menos 1 dia' })
  @ArrayMaxSize(7, { message: 'workingDays não pode ter mais de 7 dias' })
  @IsInt({
    each: true,
    message: 'Cada dia em workingDays deve ser um número inteiro',
  })
  @Min(0, {
    each: true,
    message: 'Dias devem estar entre 0 (Domingo) e 6 (Sábado)',
  })
  @Max(6, {
    each: true,
    message: 'Dias devem estar entre 0 (Domingo) e 6 (Sábado)',
  })
  @IsOptional()
  workingDays?: number[];

  @IsInt({ message: 'slotIntervalMin deve ser um número inteiro' })
  @Min(5, { message: 'slotIntervalMin deve ser no mínimo 5 minutos' })
  @Max(120, { message: 'slotIntervalMin deve ser no máximo 120 minutos' })
  @IsOptional()
  slotIntervalMin?: number;

  @IsInt({ message: 'maxAdvanceDays deve ser um número inteiro' })
  @Min(1, { message: 'maxAdvanceDays deve ser no mínimo 1 dia' })
  @Max(365, { message: 'maxAdvanceDays deve ser no máximo 365 dias' })
  @IsOptional()
  maxAdvanceDays?: number;

  @IsInt({ message: 'minAdvanceHours deve ser um número inteiro' })
  @Min(0, { message: 'minAdvanceHours deve ser no mínimo 0 horas' })
  @Max(72, { message: 'minAdvanceHours deve ser no máximo 72 horas' })
  @IsOptional()
  minAdvanceHours?: number;

  @IsBoolean({ message: 'enableReminders deve ser um booleano' })
  @IsOptional()
  enableReminders?: boolean;

  @IsInt({ message: 'reminderHoursBefore deve ser um número inteiro' })
  @Min(1, { message: 'reminderHoursBefore deve ser no mínimo 1 hora' })
  @Max(168, {
    message: 'reminderHoursBefore deve ser no máximo 168 horas (7 dias)',
  })
  @IsOptional()
  reminderHoursBefore?: number;
}
