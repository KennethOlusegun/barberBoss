import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class UserFilterDto {
  @ApiPropertyOptional({
    enum: Role,
    description: 'Filtrar por role do usuário',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
