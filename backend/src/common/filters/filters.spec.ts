import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  PrismaExceptionFilter,
} from './index';
import { Prisma } from '@prisma/client';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));
const mockGetRequest = jest.fn().mockImplementation(() => ({
  url: '/test',
  method: 'GET',
  body: {},
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest,
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
} as unknown as ArgumentsHost;

describe('Exception Filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    beforeEach(() => {
      filter = new HttpExceptionFilter();
    });

    it('deve formatar HttpException com mensagem string', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Test error',
          path: '/test',
          method: 'GET',
        }),
      );
    });

    it('deve formatar HttpException com objeto de resposta', () => {
      const exception = new HttpException(
        { message: 'Custom error', error: 'Custom Error' },
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Custom error',
          error: 'Custom Error',
        }),
      );
    });
  });

  describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;

    beforeEach(() => {
      filter = new AllExceptionsFilter();
    });

    it('deve capturar erro genérico e retornar 500', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Unexpected error',
          error: 'Error',
        }),
      );
    });

    it('deve capturar HttpException quando necessário', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Not found',
        }),
      );
    });
  });

  describe('PrismaExceptionFilter', () => {
    let filter: PrismaExceptionFilter;

    beforeEach(() => {
      filter = new PrismaExceptionFilter();
    });

    it('deve traduzir erro P2002 (unique constraint)', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: expect.stringContaining('Já existe um registro'),
          error: 'Unique Constraint Violation',
          code: 'P2002',
        }),
      );
    });

    it('deve traduzir erro P2025 (record not found)', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Registro não encontrado',
          code: 'P2025',
        }),
      );
    });

    it('deve traduzir erro P2003 (foreign key constraint)', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('chave estrangeira'),
          code: 'P2003',
        }),
      );
    });
  });
});
