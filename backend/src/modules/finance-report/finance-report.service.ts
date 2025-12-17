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
    // Calcula comissão do barbeiro
    const calcCommission = (a: any) => {
      const price = Number(a.service?.price || 0);
      const commission =
        a.service?.barberCommission != null
          ? Number(a.service.barberCommission)
          : 0.5; // padrão 50%
      return price * commission;
    };
    const completed = appointments
      .filter((a) => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + calcCommission(a), 0);
    const pending = appointments
      .filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING')
      .reduce((sum, a) => sum + calcCommission(a), 0);
    return {
      completed,
      pending,
      total: completed + pending,
      appointments,
    };
  }
}
