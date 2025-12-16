/**
 * Service Model
 *
 * Client-side model for service data
 */
export class Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price =
      typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    this.durationMin = data.durationMin;
    this.active = data.active ?? true;
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
   * Get formatted price
   */
  getFormattedPrice(currency: string = 'R$'): string {
    return `${currency} ${this.price.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Get formatted duration
   */
  getFormattedDuration(): string {
    if (this.durationMin < 60) {
      return `${this.durationMin} min`;
    }
    const hours = Math.floor(this.durationMin / 60);
    const minutes = this.durationMin % 60;
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  }

  /**
   * Calculate end time based on start time
   */
  calculateEndTime(startTime: Date): Date {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + this.durationMin);
    return endTime;
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.active;
  }
}
