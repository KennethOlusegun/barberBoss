import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message =
          (exceptionResponse as { message?: string }).message ||
          exception.message;
        error = (exceptionResponse as { error?: string }).error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Não logar exceções da rota /health para evitar poluição de logs
    if (request.url !== '/health') {
      this.logger.error(
        `Unhandled Exception: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        JSON.stringify({
          ...errorResponse,
          user: (request as Request & { user?: { id?: string } }).user?.id,
          body: request.body,
        }),
      );
    }

    response.status(status).json(errorResponse);
  }
}
