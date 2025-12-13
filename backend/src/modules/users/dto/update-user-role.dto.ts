import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: Role.BARBER,
    description: 'Novo papel do usuário',
    enum: Role,
  })
  @IsEnum(Role, { message: 'Papel inválido' })
  role: Role;
}
