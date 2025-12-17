import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Função do usuário',
    example: 'CLIENT',
    enum: ['CLIENT', 'BARBER', 'ADMIN'],
    default: 'CLIENT',
  })
  @IsString()
  @IsOptional()
  role?: 'CLIENT' | 'BARBER' | 'ADMIN';
}
