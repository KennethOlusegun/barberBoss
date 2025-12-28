
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class PasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Código deve ter exatamente 6 dígitos' })
  code: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
