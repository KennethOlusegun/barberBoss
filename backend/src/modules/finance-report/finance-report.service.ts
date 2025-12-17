import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceSummaryDto } from './dto/finance-summary.dto';

@Injectable()
export class FinanceReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinanceSummary(barberId: string): Promise<FinanceSummaryDto> {
    const appointments = await this.prisma.appointment.findMany({
      where: { barberId },
      include: { service: true },
    });
    const completed = appointments
      .filter((a) => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + Number(a.service?.price || 0), 0);
    const pending = appointments
      .filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING')
      .reduce((sum, a) => sum + Number(a.service?.price || 0), 0);
    return {
      completed,
      pending,
      total: completed + pending,
      appointments,
    };
  }
}
