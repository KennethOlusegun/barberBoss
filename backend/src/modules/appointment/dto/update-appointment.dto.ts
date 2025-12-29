import {
  IsOptional,
  IsUUID,
  IsISO8601,
  IsIn,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsBoolean,
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

/**
 * Validador customizado para UPDATE: garante que userId e clientName são mutuamente exclusivos
 */
@ValidatorConstraint({ name: 'IsUserIdXorClientNameForUpdate', async: false })
export class IsUserIdXorClientNameForUpdateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as {
      userId?: string | null;
      clientName?: string | null;
    };

    if (object.userId === undefined && object.clientName === undefined) {
      return true;
    }

    if (
      (object.userId !== undefined && object.clientName === undefined) ||
      (object.userId === undefined && object.clientName !== undefined)
    ) {
      return true;
    }

    const hasUserId = object.userId !== undefined && object.userId !== null;
    const hasClientName =
      object.clientName !== undefined && object.clientName !== null;

    if (hasUserId && hasClientName) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'No update, forneça APENAS userId (cliente cadastrado) OU clientName (agendamento manual), não ambos simultaneamente. Use null para remover um campo.';
  }
}

export class UpdateAppointmentDto {
  /**
   * Indica se a comissão já foi paga
   */
  @IsOptional()
  @IsBoolean({ message: 'commissionPaid deve ser booleano' })
  commissionPaid?: boolean;

  /**
   * ID do usuário cadastrado no sistema
   */
  @IsOptional()
  @IsUUID('4', { message: 'userId deve ser um UUID válido (formato v4)' })
  @Validate(IsUserIdXorClientNameForUpdateConstraint)
  userId?: string | null;

  /**
   * Nome do cliente para agendamento manual
   */
  @IsOptional()
  @IsString({ message: 'clientName deve ser uma string' })
  @MinLength(2, {
    message: 'Nome do cliente deve ter pelo menos 2 caracteres',
  })
  clientName?: string | null;

  /**
   * ID do serviço a ser agendado
   */
  @IsOptional()
  @IsUUID('4', { message: 'serviceId deve ser um UUID válido (formato v4)' })
  serviceId?: string;

  /**
   * Data/hora de início do agendamento (ISO 8601)
   */
  @IsOptional()
  @IsISO8601(
    { strict: true },
    {
      message:
        'startsAt deve estar no formato ISO 8601 (ex: "2025-12-10T10:00:00.000Z")',
    },
  )
  startsAt?: string;

  /**
   * Data/hora de término do agendamento (ISO 8601)
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
   */
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'NO_SHOW'], {
    message:
      'status deve ser: PENDING, CONFIRMED, CANCELED, COMPLETED ou NO_SHOW',
  })
  status?: AppointmentStatus;

  /**
   * Timezone para validações de horário comercial
   */
  @IsOptional()
  @IsString()
  timezone?: string;
}