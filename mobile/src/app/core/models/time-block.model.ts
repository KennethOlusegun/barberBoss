import { BlockType } from '../enums';
import { BLOCK_TYPE_LABELS } from '../interfaces/time-block.interface';
import { WORKING_DAY_LABELS } from '../interfaces/settings.interface';

/**
 * Time Block Model
 *
 * Client-side model for time block data
 */
export class TimeBlock {
  id: string;
  type: BlockType;
  reason?: string;
  startsAt: Date;
  endsAt: Date;
  isRecurring: boolean;
  recurringDays: number[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.type = data.type as BlockType;
    this.reason = data.reason;
    this.startsAt = data.startsAt instanceof Date ? data.startsAt : new Date(data.startsAt);
    this.endsAt = data.endsAt instanceof Date ? data.endsAt : new Date(data.endsAt);
    this.isRecurring = data.isRecurring ?? false;
    this.recurringDays = data.recurringDays || [];
    this.active = data.active ?? true;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    this.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt);
  }

  /**
   * Get block type label
   */
  getTypeLabel(): string {
    return BLOCK_TYPE_LABELS[this.type] || this.type;
  }

  /**
   * Get display title
   */
  getDisplayTitle(): string {
    if (this.reason) {
      return `${this.getTypeLabel()}: ${this.reason}`;
    }
    return this.getTypeLabel();
  }

  /**
   * Get formatted date range
   */
  getFormattedDateRange(): string {
    const startDate = this.startsAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const endDate = this.endsAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  }

  /**
   * Get formatted time range
   */
  getFormattedTimeRange(): string {
    const startTime = this.startsAt.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = this.endsAt.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${startTime} - ${endTime}`;
  }

  /**
   * Get recurring days labels
   */
  getRecurringDaysLabels(): string[] {
    return this.recurringDays
      .sort()
      .map(day => WORKING_DAY_LABELS[day]);
  }

  /**
   * Get recurring days as string
   */
  getRecurringDaysString(): string {
    if (!this.isRecurring || this.recurringDays.length === 0) {
      return 'Não se repete';
    }

    const labels = this.getRecurringDaysLabels();
    if (labels.length === 7) return 'Todos os dias';
    if (labels.length === 1) return labels[0];
    return labels.join(', ');
  }

  /**
   * Check if block is active on a specific date
   */
  isActiveOnDate(date: Date): boolean {
    if (!this.active) return false;

    if (this.isRecurring) {
      const dayOfWeek = date.getDay();
      return this.recurringDays.includes(dayOfWeek);
    }

    // For non-recurring blocks, check if date is within the range
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const startDate = new Date(this.startsAt);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.endsAt);
    endDate.setHours(0, 0, 0, 0);

    return dateOnly >= startDate && dateOnly <= endDate;
  }

  /**
   * Check if block overlaps with a time range
   */
  overlapsWithTimeRange(start: Date, end: Date): boolean {
    if (!this.active) return false;

    return this.startsAt < end && this.endsAt > start;
  }

  /**
   * Check if block is in the past
   */
  isPast(): boolean {
    return this.endsAt < new Date();
  }

  /**
   * Check if block is currently active
   */
  isCurrentlyActive(): boolean {
    const now = new Date();
    return this.active && this.startsAt <= now && this.endsAt >= now;
  }

  /**
   * Get duration in minutes
   */
  getDurationMinutes(): number {
    return Math.round((this.endsAt.getTime() - this.startsAt.getTime()) / 60000);
  }

  /**
   * Get block type color
   */
  getTypeColor(): string {
    const colors: Record<BlockType, string> = {
      [BlockType.LUNCH]: 'warning',
      [BlockType.BREAK]: 'medium',
      [BlockType.DAY_OFF]: 'primary',
      [BlockType.VACATION]: 'success',
      [BlockType.CUSTOM]: 'tertiary'
    };
    return colors[this.type] || 'medium';
  }
}
