import { TimeBlock as PrismaTimeBlock, BlockType } from '@prisma/client';

export class TimeBlock implements PrismaTimeBlock {
  id: string;
  type: BlockType;
  reason: string | null;
  startsAt: Date;
  endsAt: Date;
  isRecurring: boolean;
  recurringDays: number[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TimeBlock>) {
    Object.assign(this, partial);
  }
}
