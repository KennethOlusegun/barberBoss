import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, Matches, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '(11) 98765-4321',
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @Matches(/^\(?\d{2}\)?[\s-]?9?\d{4}-?\d{4}$/,
    { message: 'Telefone inválido. Use o formato (99) 99999-9999' })
  phone?: string;

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
