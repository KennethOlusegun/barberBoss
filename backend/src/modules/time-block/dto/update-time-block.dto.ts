import { PartialType } from '@nestjs/swagger';
import { CreateTimeBlockDto } from './create-time-block.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTimeBlockDto extends PartialType(CreateTimeBlockDto) {
  @IsBoolean({ message: 'active deve ser um booleano' })
  @IsOptional()
  active?: boolean;
}
