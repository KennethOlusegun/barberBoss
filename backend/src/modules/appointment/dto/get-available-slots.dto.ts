import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsDateString(
    {},
    { message: 'date deve ser uma data válida no formato ISO 8601' },
  )
  @IsNotEmpty({ message: 'date é obrigatório' })
  date: string;

  @IsUUID('4', { message: 'serviceId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'serviceId é obrigatório' })
  serviceId: string;
}
