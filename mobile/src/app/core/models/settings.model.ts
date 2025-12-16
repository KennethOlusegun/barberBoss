import { WORKING_DAY_LABELS } from '../interfaces/settings.interface';

/**
 * Settings Model
 *
 * Client-side model for settings data
 */
export class Settings {
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

  constructor(data: any) {
    this.id = data.id;
    this.businessName = data.businessName || 'Barber Boss';
    this.openTime = data.openTime || '08:00';
    this.closeTime = data.closeTime || '18:00';
    this.workingDays = data.workingDays || [1, 2, 3, 4, 5, 6];
    this.slotIntervalMin = data.slotIntervalMin || 15;
    this.maxAdvanceDays = data.maxAdvanceDays || 30;
    this.minAdvanceHours = data.minAdvanceHours || 2;
    this.enableReminders = data.enableReminders ?? false;
    this.reminderHoursBefore = data.reminderHoursBefore || 24;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
  }

  /**
   * Get formatted business hours
   */
  getBusinessHours(): string {
    return `${this.openTime} - ${this.closeTime}`;
  }

  /**
   * Get working days labels
   */
  getWorkingDaysLabels(): string[] {
    return this.workingDays.sort().map((day) => WORKING_DAY_LABELS[day]);
  }

  /**
   * Get working days as string
   */
  getWorkingDaysString(): string {
    const labels = this.getWorkingDaysLabels();
    if (labels.length === 0) return 'Nenhum dia';
    if (labels.length === 7) return 'Todos os dias';
    if (labels.length === 1) return labels[0];
    return `${labels[0]} a ${labels[labels.length - 1]}`;
  }

  /**
   * Check if a day is working day
   */
  isWorkingDay(dayOfWeek: number): boolean {
    return this.workingDays.includes(dayOfWeek);
  }

  /**
   * Get opening time as Date
   */
  getOpeningTime(date: Date = new Date()): Date {
    const [hours, minutes] = this.openTime.split(':').map(Number);
    const openingTime = new Date(date);
    openingTime.setHours(hours, minutes, 0, 0);
    return openingTime;
  }

  /**
   * Get closing time as Date
   */
  getClosingTime(date: Date = new Date()): Date {
    const [hours, minutes] = this.closeTime.split(':').map(Number);
    const closingTime = new Date(date);
    closingTime.setHours(hours, minutes, 0, 0);
    return closingTime;
  }

  /**
   * Check if time is within business hours
   */
  isWithinBusinessHours(time: Date): boolean {
    const dayOfWeek = time.getDay();
    if (!this.isWorkingDay(dayOfWeek)) {
      return false;
    }

    const openingTime = this.getOpeningTime(time);
    const closingTime = this.getClosingTime(time);

    return time >= openingTime && time <= closingTime;
  }

  /**
   * Get maximum booking date
   */
  getMaxBookingDate(): Date {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + this.maxAdvanceDays);
    return maxDate;
  }

  /**
   * Get minimum booking date/time
   */
  getMinBookingDateTime(): Date {
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + this.minAdvanceHours);
    return minDate;
  }

  /**
   * Check if date is bookable
   */
  isDateBookable(date: Date): boolean {
    const now = new Date();
    const minBooking = this.getMinBookingDateTime();
    const maxBooking = this.getMaxBookingDate();

    return date >= minBooking && date <= maxBooking;
  }
}
