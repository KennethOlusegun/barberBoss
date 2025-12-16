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
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

/**
 * Validador customizado para UPDATE: garante que userId e clientName são mutuamente exclusivos
 * Diferente do Create, aqui permitimos que ambos sejam undefined (não alterados)
 */
@ValidatorConstraint({ name: 'IsUserIdXorClientNameForUpdate', async: false })
export class IsUserIdXorClientNameForUpdateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as {
      userId?: string | null;
      clientName?: string | null;
    };

    // Se nenhum dos dois foi fornecido no update, está OK (não alterar)
    if (object.userId === undefined && object.clientName === undefined) {
      return true;
    }

    // Se apenas um está sendo alterado (o outro é undefined), está OK
    if (
      (object.userId !== undefined && object.clientName === undefined) ||
      (object.userId === undefined && object.clientName !== undefined)
    ) {
      return true;
    }

    // Se ambos estão sendo alterados simultaneamente, NÃO está OK
    // Exceto se um deles for explicitamente null (para remover)
    const hasUserId = object.userId !== undefined && object.userId !== null;
    const hasClientName =
      object.clientName !== undefined && object.clientName !== null;

    // Permitir: userId=null + clientName="João" (trocar de cliente cadastrado para manual)
    // Permitir: userId="abc" + clientName=null (trocar de manual para cadastrado)
    // Bloquear: userId="abc" + clientName="João" (ambos preenchidos)
    if (hasUserId && hasClientName) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'No update, forneça APENAS userId (cliente cadastrado) OU clientName (agendamento manual), não ambos simultaneamente. Use null para remover um campo.';
  }
}

/**
 * DTO para atualização de agendamentos
 * Todos os campos são opcionais, mas seguem as mesmas regras de validação
 *
 * IMPORTANTE: Para alternar entre userId e clientName:
 * - De manual para cadastrado: { userId: "abc-123", clientName: null }
 * - De cadastrado para manual: { userId: null, clientName: "João Silva" }
 */
export class UpdateAppointmentDto {
  /**
   * ID do usuário cadastrado no sistema
   * Se fornecido com valor, clientName deve ser null ou undefined
   * Use null explicitamente para remover userId existente
   */
  @IsOptional()
  @IsUUID('4', { message: 'userId deve ser um UUID válido (formato v4)' })
  @Validate(IsUserIdXorClientNameForUpdateConstraint)
  userId?: string | null;

  /**
   * Nome do cliente para agendamento manual
   * Se fornecido com valor, userId deve ser null ou undefined
   * Use null explicitamente para remover clientName existente
   */
  @IsOptional()
  @IsString({ message: 'clientName deve ser uma string' })
  @MinLength(2, {
    message: 'Nome do cliente deve ter pelo menos 2 caracteres',
  })
  clientName?: string | null;

  /**
   * ID do serviço a ser agendado
   * Se alterado, endsAt será recalculado automaticamente
   */
  @IsOptional()
  @IsUUID('4', { message: 'serviceId deve ser um UUID válido (formato v4)' })
  serviceId?: string;

  /**
   * Data/hora de início do agendamento (ISO 8601)
   * Se alterado, endsAt será recalculado automaticamente (se não fornecido)
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
   * Opcional: se não fornecido, será calculado automaticamente
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
