import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Exemplo de Controller demonstrando como os Exception Filters
 * capturam e formatam diferentes tipos de erros
 */
@Controller('examples/filters')
export class FilterExamplesController {
  constructor(private prisma: PrismaService) {}

  /**
   * Exemplo 1: HttpException - NotFoundException
   * O HttpExceptionFilter captura e formata
   */
  @Get('not-found/:id')
  async notFoundExample(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  /**
   * Exemplo 2: HttpException - BadRequestException
   * O HttpExceptionFilter captura e formata
   */
  @Post('bad-request')
  badRequestExample(@Body() data: { email?: string }) {
    if (!data.email) {
      throw new BadRequestException('Email é obrigatório');
    }

    if (!data.email.includes('@')) {
      throw new BadRequestException('Email inválido');
    }

    return { message: 'Email válido' };
  }

  /**
   * Exemplo 3: Prisma P2002 - Unique Constraint
   * O PrismaExceptionFilter captura e traduz
   */
  @Post('duplicate-email')
  async duplicateEmailExample(@Body() data: { email: string; name: string }) {
    // Se o email já existir, o Prisma lançará P2002
    // O PrismaExceptionFilter traduzirá para:
    // "Já existe um registro com este(s) valor(es): email"
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: 'hashedPassword',
        role: 'CLIENT',
      },
    });

    return user;
  }

  /**
   * Exemplo 4: Prisma P2025 - Record Not Found
   * O PrismaExceptionFilter captura e traduz
   */
  @Get('delete-nonexistent/:id')
  async deleteNonexistentExample(@Param('id') id: string) {
    // Se o ID não existir, o Prisma lançará P2025
    // O PrismaExceptionFilter traduzirá para:
    // "Registro não encontrado"
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return user;
  }

  /**
   * Exemplo 5: Erro Inesperado
   * O AllExceptionsFilter captura e formata
   */
  @Get('unexpected-error')
  unexpectedErrorExample() {
    // Este erro não é uma HttpException nem um erro do Prisma
    // O AllExceptionsFilter capturará e formatará como erro 500
    const obj: { property?: string } | null = null;
    return (obj as { property?: string } | null)?.property; // Safe access
  }

  /**
   * Exemplo 6: Prisma P2003 - Foreign Key Constraint
   * O PrismaExceptionFilter captura e traduz
   */
  @Post('invalid-foreign-key')
  async invalidForeignKeyExample(@Body() data: { userId: string }) {
    // Se o userId não existir, o Prisma lançará P2003
    // O PrismaExceptionFilter traduzirá para:
    // "Violação de chave estrangeira - registro relacionado não existe"
    const appointment = await this.prisma.appointment.create({
      data: {
        userId: data.userId,
        serviceId: 'uuid-qualquer',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 60 * 60 * 1000), // +1 hora
        status: 'CONFIRMED',
      },
    });

    return appointment;
  }

  /**
   * Exemplo 7: HttpException - UnauthorizedException
   * O HttpExceptionFilter captura e formata
   */
  @Get('unauthorized')
  unauthorizedExample() {
    throw new UnauthorizedException('Token inválido ou expirado');
  }

  /**
   * Exemplo 8: HttpException - ForbiddenException
   * O HttpExceptionFilter captura e formata
   */
  @Get('forbidden')
  forbiddenExample() {
    throw new ForbiddenException(
      'Você não tem permissão para acessar este recurso',
    );
  }

  /**
   * Exemplo 9: Validação com ValidationPipe
   * O HttpExceptionFilter captura os erros de validação
   */
  @Post('validation')
  validationExample(@Body() data: CreateUserDto) {
    // Se os dados não passarem na validação do DTO,
    // o ValidationPipe lançará BadRequestException
    // O HttpExceptionFilter formatará a resposta
    return { message: 'Dados válidos', data };
  }
}

// DTO de exemplo para validação
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsEnum(['ADMIN', 'BARBER', 'CLIENT'], {
    message: 'Role deve ser ADMIN, BARBER ou CLIENT',
  })
  role: string;
}
