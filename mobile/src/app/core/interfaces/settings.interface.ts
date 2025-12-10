/**
 * Settings Interface
 *
 * Represents barbershop settings and configuration
 */
export interface ISettings {
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
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Settings Update DTO
 *
 * Data Transfer Object for updating settings
 */
export interface ISettingsUpdate {
  businessName?: string;
  openTime?: string;
  closeTime?: string;
  workingDays?: number[];
  slotIntervalMin?: number;
  maxAdvanceDays?: number;
  minAdvanceHours?: number;
  enableReminders?: boolean;
  reminderHoursBefore?: number;
}

/**
 * Business Hours Interface
 *
 * Represents business operating hours
 */
export interface IBusinessHours {
  openTime: string;
  closeTime: string;
  workingDays: number[];
}

/**
 * Working Day Labels
 *
 * Map of day numbers to day names
 */
export const WORKING_DAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado'
};
