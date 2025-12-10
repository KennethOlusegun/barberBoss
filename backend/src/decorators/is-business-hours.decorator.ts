import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

interface BusinessHoursOptions {
  startHour?: number; // Hora de início (0-23), padrão: 8
  endHour?: number; // Hora de término (0-23), padrão: 18
  workingDays?: number[]; // Dias da semana (0=Domingo, 6=Sábado), padrão: 1-6 (Segunda a Sábado)
}

/**
 * Decorator para validar se uma data está dentro do horário comercial
 * @param options Opções de configuração do horário comercial
 * @param validationOptions Opções de validação do class-validator
 */
export function IsBusinessHours(
  options: BusinessHoursOptions = {},
  validationOptions?: ValidationOptions,
) {
  const {
    startHour = 8,
    endHour = 18,
    workingDays = [1, 2, 3, 4, 5, 6], // Segunda a Sábado por padrão
  } = options;

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBusinessHours',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (!value) return true; // Se não há valor, deixa outros decorators validarem

          try {
            const date = new Date(value as string | Date);
            if (isNaN(date.getTime())) {
              return false;
            }

            const day = date.getDay();
            const hour = date.getHours();

            // Verifica se é um dia útil
            if (!workingDays.includes(day)) {
              return false;
            }

            // Verifica se está dentro do horário comercial
            if (hour < startHour || hour >= endHour) {
              return false;
            }

            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const daysOfWeek = [
            'Domingo',
            'Segunda-feira',
            'Terça-feira',
            'Quarta-feira',
            'Quinta-feira',
            'Sexta-feira',
            'Sábado',
          ];

          const workingDaysNames = workingDays
            .map((day) => daysOfWeek[day])
            .join(', ');

          return `${args.property} deve ser dentro do horário comercial (${startHour}:00 - ${endHour}:00) e em dias úteis (${workingDaysNames})`;
        },
      },
    });
  };
}
