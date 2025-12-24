import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string }).message ||
            exception.message,
      error:
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as { error?: string }).error
          ? (exceptionResponse as { error?: string }).error
          : HttpStatus[status],
    };


    // Não logar exceções da rota /health para evitar poluição de logs
    if (request.url !== '/health') {
      this.logger.error(
        `HTTP Exception: ${request.method} ${request.url}`,
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
