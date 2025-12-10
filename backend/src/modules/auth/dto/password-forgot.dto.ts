import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordForgotDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;
}
