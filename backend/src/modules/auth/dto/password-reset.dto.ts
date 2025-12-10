import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({ example: 'token-recebido-no-email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NovaSenha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
