import { Settings as PrismaSettings } from '@prisma/client';

export class Settings implements PrismaSettings {
  id: string;
  businessName: string;
  openTime: string;
  closeTime: string;
  workingDays: number[];
  slotIntervalMin: number;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  enableReminders: boolean;
  reminderHoursBefore: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Settings>) {
    Object.assign(this, partial);
  }
}
