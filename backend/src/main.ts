import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import './config/dayjs.config';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  PrismaExceptionFilter,
} from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ FIX 1: Helmet com CSP mais restritivo e headers adicionais
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"], // ✅ Removido 'unsafe-inline'
          styleSrc: ["'self'"], // ✅ Removido 'unsafe-inline'
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"], // ✅ Bloqueia plugins
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"], // ✅ Bloqueia iframes
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [], // ✅ Force HTTPS
        },
      },
      hsts: {
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: false, // Necessário para Swagger
    }),
  );

  // ✅ FIX 2: CORS com validação dinâmica de origin
  const getAllowedOrigins = (): string[] => {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ALLOWED_ORIGINS) {
        throw new Error(
          'ALLOWED_ORIGINS deve ser configurado em produção (ex: https://app.exemplo.com,https://admin.exemplo.com)',
        );
      }
      return process.env.ALLOWED_ORIGINS.split(',').map((origin) =>
        origin.trim(),
      );
    }
    // Em desenvolvimento, permitir localhost em qualquer porta
     return ['http://localhost:8100', 'http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:3000'];
  };

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();

      // Permitir requests sem origin (mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `Origin ${origin} não permitida pelo CORS. Origins permitidas: ${allowedOrigins.join(', ')}`,
          ),
        );
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // ✅ ADICIONAR: Transformação mais segura
      transformOptions: {
        enableImplicitConversion: true,
      },
      // ✅ ADICIONAR: Validação mais rigorosa
      stopAtFirstError: false, // Retorna TODOS os erros
      disableErrorMessages: process.env.NODE_ENV === 'production', // Oculta detalhes em prod
    }),
  );

  // Exception Filters Globais (ordem correta mantida)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new PrismaExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // ✅ FIX 3: Swagger com autenticação e segurança
  const config = new DocumentBuilder()
    .setTitle('Barber Boss API')
    .setDescription('API para gerenciamento de barbearia')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Operações relacionadas aos usuários')
    .addTag('services', 'Operações relacionadas aos serviços')
    .addTag('appointments', 'Operações relacionadas aos agendamentos')
    .addTag('settings', 'Configurações da barbearia')
    .addTag('time-blocks', 'Bloqueio de horários')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT obtido no /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    // ✅ ADICIONAR: Informações de contato e licença
    .setContact(
      'Equipe BarberBoss',
      'https://barberboss.com',
      'contato@barberboss.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ✅ FIX 4: Swagger apenas em desenvolvimento/staging
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Mantém token após refresh
      },
    });
  } else {
    // Em produção, Swagger protegido por senha básica ou desabilitado
    console.warn('⚠️  Swagger UI desabilitado em produção por segurança');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
  console.log(`🔒 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS: ${getAllowedOrigins().join(', ')}`);
}

void bootstrap();
