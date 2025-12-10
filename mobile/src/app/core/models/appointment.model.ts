import { AppointmentStatus } from '../enums';
import { User } from './user.model';
import { Service } from './service.model';

/**
 * Appointment Model
 *
 * Client-side model for appointment data
 */
export class Appointment {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  userId?: string;
  user?: User;
  clientName?: string;
  serviceId: string;
  service?: Service;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.startsAt = data.startsAt instanceof Date ? data.startsAt : new Date(data.startsAt);
    this.endsAt = data.endsAt instanceof Date ? data.endsAt : new Date(data.endsAt);
    this.status = data.status as AppointmentStatus;
    this.userId = data.userId;
    this.user = data.user ? new User(data.user) : undefined;
    this.clientName = data.clientName;
    this.serviceId = data.serviceId;
    this.service = data.service ? new Service(data.service) : undefined;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    this.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt);
  }

  /**
   * Get client display name
   */
  getClientName(): string {
    return this.user?.name || this.clientName || 'Cliente sem nome';
  }

  /**
   * Get formatted date
   */
  getFormattedDate(): string {
    return this.startsAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
   * Get duration in minutes
   */
  getDurationMinutes(): number {
    return Math.round((this.endsAt.getTime() - this.startsAt.getTime()) / 60000);
  }

  /**
   * Check if appointment is in the past
   */
  isPast(): boolean {
    return this.endsAt < new Date();
  }

  /**
   * Check if appointment is today
   */
  isToday(): boolean {
    const today = new Date();
    return this.startsAt.toDateString() === today.toDateString();
  }

  /**
   * Check if appointment can be canceled
   */
  canBeCanceled(): boolean {
    return (
      !this.isPast() &&
      (this.status === AppointmentStatus.PENDING ||
        this.status === AppointmentStatus.CONFIRMED)
    );
  }

  /**
   * Check if appointment can be edited
   */
  canBeEdited(): boolean {
    return (
      !this.isPast() &&
      (this.status === AppointmentStatus.PENDING ||
        this.status === AppointmentStatus.CONFIRMED)
    );
  }

  /**
   * Get status label
   */
  getStatusLabel(): string {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'Pendente',
      [AppointmentStatus.CONFIRMED]: 'Confirmado',
      [AppointmentStatus.CANCELED]: 'Cancelado',
      [AppointmentStatus.COMPLETED]: 'Concluído',
      [AppointmentStatus.NO_SHOW]: 'Cliente não compareceu'
    };
    return labels[this.status] || this.status;
  }

  /**
   * Get status color
   */
  getStatusColor(): string {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'warning',
      [AppointmentStatus.CONFIRMED]: 'primary',
      [AppointmentStatus.CANCELED]: 'danger',
      [AppointmentStatus.COMPLETED]: 'success',
      [AppointmentStatus.NO_SHOW]: 'medium'
    };
    return colors[this.status] || 'medium';
  }
}
