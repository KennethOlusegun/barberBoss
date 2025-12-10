import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt-strategies';
import { PrismaModule } from '../../prisma/prisma.module';
import { PasswordForgotController } from './password-forgot.controller';
import { PasswordForgotService } from './password-forgot.service';
import { BrevoService } from './brevo.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get('JWT_SECRET', 'default_secret_key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
    PrismaModule,
  ],
  controllers: [AuthController, PasswordForgotController],
  providers: [AuthService, JwtStrategy, PasswordForgotService, BrevoService],
  exports: [AuthService],
})
export class AuthModule {}
