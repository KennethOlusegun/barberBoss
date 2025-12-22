import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsISO8601,
  MinLength,
  IsIn,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

/**
 * Validador customizado: garante que userId e clientName são mutuamente exclusivos
 */
@ValidatorConstraint({ name: 'IsUserIdXorClientName', async: false })
export class IsUserIdXorClientNameConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as { userId?: string; clientName?: string };
    const hasUserId = !!object.userId;
    const hasClientName = !!object.clientName;
    // Deve ter exatamente um deles (XOR)
    return hasUserId !== hasClientName;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as { userId?: string; clientName?: string };
    const hasUserId = !!object.userId;
    const hasClientName = !!object.clientName;
    if (hasUserId && hasClientName) {
      return 'Forneça APENAS userId (cliente cadastrado) OU clientName (agendamento manual), não ambos.';
    }
    return 'É necessário fornecer userId (cliente cadastrado) ou clientName (agendamento manual).';
  }
}

export class CreateAppointmentDto {
  /**
   * ID do usuário cadastrado no sistema (Fase 2)
   * Mutuamente exclusivo com clientName
   */
  @IsOptional()
  @IsUUID('4', { message: 'userId deve ser um UUID válido (formato v4)' })
  @Validate(IsUserIdXorClientNameConstraint)
  userId?: string;

  /**
   * Nome do cliente para agendamento manual (Fase 1)
   * Obrigatório quando userId não for fornecido
   */
  @IsOptional()
  @IsString({ message: 'clientName deve ser uma string' })
  @MinLength(2, {
    message: 'Nome do cliente deve ter pelo menos 2 caracteres',
  })
  clientName?: string;

  /**
   * ID do barbeiro responsável pelo atendimento
   */
  @IsNotEmpty({ message: 'barberId é obrigatório' })
  @IsUUID('4', { message: 'barberId deve ser um UUID válido (formato v4)' })
  barberId: string;

  /**
   * ID do serviço a ser agendado
   */
  @IsNotEmpty({ message: 'serviceId é obrigatório' })
  @IsUUID('4', { message: 'serviceId deve ser um UUID válido (formato v4)' })
  serviceId: string;

  /**
   * Data/hora de início do agendamento (ISO 8601)
   * Exemplo: "2025-12-10T10:00:00.000Z" ou "2025-12-10T10:00:00-03:00"
   */
  @IsNotEmpty({ message: 'startsAt é obrigatório' })
  @IsISO8601(
    { strict: true },
    {
      message:
        'startsAt deve estar no formato ISO 8601 (ex: "2025-12-10T10:00:00.000Z")',
    },
  )
  startsAt: string;

  /**
   * Data/hora de término do agendamento (ISO 8601)
   * Opcional: se não fornecido, será calculado automaticamente
   * baseado na duração do serviço
   */
  @IsOptional()
  @IsISO8601(
    { strict: true },
    {
      message:
        'endsAt deve estar no formato ISO 8601 (ex: "2025-12-10T11:00:00.000Z")',
    },
  )
  endsAt?: string;

  /**
   * Status do agendamento
   * Padrão: CONFIRMED
   */
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'NO_SHOW'], {
    message:
      'status deve ser: PENDING, CONFIRMED, CANCELED, COMPLETED ou NO_SHOW',
  })
  status?: AppointmentStatus;

  /**
   * Timezone para validações de horário comercial
   * Padrão: America/Sao_Paulo
   */
  @IsOptional()
  @IsString()
  timezone?: string;
}
