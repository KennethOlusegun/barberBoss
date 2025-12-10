import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ServiceModule } from './modules/service/service.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TimeBlockModule } from './modules/time-block/time-block.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3, // 3 requisições por segundo
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20, // 20 requisições por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições por minuto
      },
    ]),
    PrismaModule,
    AuthModule,
    UserModule,
    ServiceModule,
    AppointmentModule,
    SettingsModule,
    TimeBlockModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
