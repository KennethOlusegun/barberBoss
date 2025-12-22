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

  // ===== HELMET - Configuração flexível para DEV/PROD =====
  if (process.env.NODE_ENV === 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        crossOriginEmbedderPolicy: false,
      }),
    );
  } else {
    // Em DEV: Helmet desabilitado para evitar conflitos com Ngrok
    console.log('⚠️  Helmet desabilitado em desenvolvimento');
  }

  // ===== CORS - Compatível com Mobile (Capacitor) + Ngrok =====
  const getAllowedOrigins = (): string[] => {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ALLOWED_ORIGINS) {
        throw new Error('ALLOWED_ORIGINS deve ser configurado em produção');
      }
      return process.env.ALLOWED_ORIGINS.split(',').map((origin) =>
        origin.trim(),
      );
    }

    // Em desenvolvimento: Permissivo para todos os cenários
    return [
      'http://localhost:8100',
      'http://localhost:4200',
      'http://localhost:3000',
      'http://127.0.0.1:4200',
      'http://127.0.0.1:8100',
      'http://192.168.0.8:8100',
      'http://192.168.0.8:4200',
      'http://192.168.0.9:8100',
      'capacitor://localhost', // 🔥 CRÍTICO: App Capacitor no iOS
      'ionic://localhost', // 🔥 CRÍTICO: App Capacitor no Android
      'http://localhost', // 🔥 CRÍTICO: Capacitor genérico
      'https://edacious-closer-catrice.ngrok-free.dev', // 🔥 NGROK DOMÍNIO FIXO
    ];
  };

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();

      // 🔥 CRÍTICO: Permitir requests sem origin
      // Mobile apps (Capacitor), Postman, curl não enviam origin
      if (!origin) {
        return callback(null, true);
      }

      // Verificar se origin está na lista
      const isAllowed = allowedOrigins.some((allowed) => {
        // Match exato ou prefixo (para portas dinâmicas)
        return origin === allowed || origin.startsWith(allowed);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS bloqueou origin: ${origin}`);
        console.warn(`✅ Origins permitidas: ${allowedOrigins.join(', ')}`);

        // Em DEV: Permitir mesmo assim (log de warning)
        if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} não permitida pelo CORS`));
        }
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'ngrok-skip-browser-warning', // 🔥 CRÍTICO: Header do Ngrok
      'Origin',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 86400, // 24h
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Exception Filters Globais
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new PrismaExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // ===== SWAGGER =====
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
    .setContact(
      'Equipe BarberBoss',
      'https://barberboss.com',
      'contato@barberboss.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  } else {
    console.warn('⚠️  Swagger UI desabilitado em produção por segurança');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); // 🔥 CRÍTICO: 0.0.0.0 para Docker

  console.log('');
  console.log('🚀 Aplicação rodando em:');
  console.log(`   Local:  http://localhost:${port}`);
  console.log(`   Docker: http://0.0.0.0:${port}`);
  if (process.env.NGROK_DOMAIN) {
    console.log(`   Ngrok:  https://${process.env.NGROK_DOMAIN}`);
  }
  console.log('');
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
  console.log(`🔒 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS Origins: ${getAllowedOrigins().length} configuradas`);
  console.log('');
}

void bootstrap();
