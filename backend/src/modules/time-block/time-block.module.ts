import { Module } from '@nestjs/common';
import { TimeBlockService } from './time-block.service';
import { TimeBlockController } from './time-block.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimeBlockController],
  providers: [TimeBlockService],
  exports: [TimeBlockService],
})
export class TimeBlockModule {}
