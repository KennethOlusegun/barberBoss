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

  // 🔥 ADICIONAR PREFIXO GLOBAL /api
  app.setGlobalPrefix('api');

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
  app.enableCors({
    origin: [
      // Localhost
      'http://localhost:3000',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8081',

      // Ngrok - aceita qualquer subdomínio
      /^https:\/\/.*\.ngrok-free\.dev$/,
      /^https:\/\/.*\.ngrok\.io$/,
      /^https:\/\/.*\.ngrok\.app$/,

      // Rede local (192.168.x.x)
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,

      // Expo
      /^exp:\/\/.*/,

      // Capacitor (iOS/Android)
      'capacitor://localhost',
      'http://localhost',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    maxAge: 86400, // 24 horas
  });

  console.log('🌐 CORS configurado para ngrok, mobile e rede local.');

  // ===== VALIDATION PIPE GLOBAL =====
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ===== EXCEPTION FILTERS GLOBAIS =====
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
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  } else {
    console.warn('⚠️  Swagger UI desabilitado em produção por segurança');
  }

  // ===== START SERVER =====
  // O Render injeta a porta automaticamente na variável process.env.PORT
  const port = process.env.PORT || 10000;
  // É CRUCIAL usar '0.0.0.0' para que o Render consiga acessar o container
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);

  console.log('');
  console.log('='.repeat(70));
  console.log('🚀 BarberBoss Backend - RODANDO');
  console.log('='.repeat(70));
  console.log(`📍 Local:       http://localhost:${port}/api`);
  console.log(`📍 Docker:      http://0.0.0.0:${port}/api`);
  if (process.env.NGROK_DOMAIN) {
    console.log(`📍 Ngrok:       https://${process.env.NGROK_DOMAIN}/api`);
  } else {
    console.log(`📍 Ngrok:       Verifique http://localhost:4040`);
  }
  console.log('');
  console.log(`📚 Swagger UI:  http://localhost:${port}/api/docs`);
  console.log(`🔐 Ambiente:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS:        Habilitado para Mobile + Ngrok`);
  console.log('='.repeat(70));
  console.log('');
}

void bootstrap();
