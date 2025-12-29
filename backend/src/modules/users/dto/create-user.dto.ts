import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'joao@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '(11) 98765-4321',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @Matches(/^\(?\d{2}\)?[\s-]?9?\d{4}-?\d{4}$/,
    { message: 'Telefone inválido. Use o formato (99) 99999-9999' })
  phone: string;

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
