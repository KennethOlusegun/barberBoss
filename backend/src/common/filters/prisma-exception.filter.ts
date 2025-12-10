import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro no banco de dados';
    let error = 'Database Error';

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        message = `Já existe um registro com este(s) valor(es): ${target.join(', ')}`;
        error = 'Unique Constraint Violation';
        break;
      }

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado';
        error = 'Record Not Found';
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message =
          'Violação de chave estrangeira - registro relacionado não existe';
        error = 'Foreign Key Constraint Violation';
        break;

      case 'P2014':
        // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'A operação viola uma relação obrigatória';
        error = 'Required Relation Violation';
        break;

      case 'P2021':
        // Table does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Erro de configuração do banco de dados';
        error = 'Table Not Found';
        break;

      case 'P2022':
        // Column does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Erro de configuração do banco de dados';
        error = 'Column Not Found';
        break;

      case 'P2000':
        // Value too long
        status = HttpStatus.BAD_REQUEST;
        message = 'Valor muito longo para o campo';
        error = 'Value Too Long';
        break;

      case 'P2001':
        // Record not found in where condition
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado para a condição especificada';
        error = 'Record Not Found';
        break;

      case 'P2011':
        // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Campo obrigatório não pode ser nulo';
        error = 'Null Constraint Violation';
        break;

      case 'P2012':
        // Missing required value
        status = HttpStatus.BAD_REQUEST;
        message = 'Valor obrigatório ausente';
        error = 'Missing Required Value';
        break;

      case 'P2015':
        // Related record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro relacionado não encontrado';
        error = 'Related Record Not Found';
        break;

      default:
        this.logger.error(
          `Unhandled Prisma Error Code: ${exception.code}`,
          JSON.stringify(exception),
        );
        break;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      code: exception.code,
    };

    // Log detalhado do erro
    this.logger.error(
      `Prisma Exception: ${exception.code} - ${request.method} ${request.url}`,
      JSON.stringify({
        ...errorResponse,
        meta: exception.meta,
        user: request.user?.id,
      }),
    );

    response.status(status).json(errorResponse);
  }
}
