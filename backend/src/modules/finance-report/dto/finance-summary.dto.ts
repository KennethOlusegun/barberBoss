import { ApiProperty } from '@nestjs/swagger';

export class FinanceSummaryDto {
  @ApiProperty()
  completed: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: Array })
  appointments: any[];
}
