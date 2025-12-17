import { Module } from '@nestjs/common';
import { FinanceReportService } from './finance-report.service';
import { FinanceReportController } from './finance-report.controller';

@Module({
  controllers: [FinanceReportController],
  providers: [FinanceReportService],
})
export class FinanceReportModule {}
