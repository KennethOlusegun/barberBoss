import { Controller, Get, Query } from '@nestjs/common';
import { FinanceReportService } from './finance-report.service';
import { FinanceSummaryDto } from './dto/finance-summary.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('finance-report')
@Controller('finance-report')
export class FinanceReportController {
  constructor(private readonly financeReportService: FinanceReportService) {}

  @Get('summary')
  @ApiQuery({ name: 'barberId', required: true })
  @ApiOkResponse({ type: FinanceSummaryDto })
  async getFinanceSummary(
    @Query('barberId') barberId: string,
  ): Promise<FinanceSummaryDto> {
    return this.financeReportService.getFinanceSummary(barberId);
  }
}
