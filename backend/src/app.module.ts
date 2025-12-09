import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ServiceModule } from './service/service.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [PrismaModule, UserModule, ServiceModule, AppointmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
