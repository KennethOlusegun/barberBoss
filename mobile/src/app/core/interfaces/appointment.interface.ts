import { AppointmentStatus } from '../enums';
import { IUser } from './user.interface';
import { IService } from './service.interface';

/**
 * Appointment Interface
 *
 * Represents an appointment in the system
 */
export interface IAppointment {
  id: string;
  startsAt: Date | string;
  endsAt: Date | string;
  status: AppointmentStatus;
  userId?: string;
  user?: IUser;
  clientName?: string;
  serviceId: string;
  service?: IService;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Appointment Create DTO
 *
 * Data Transfer Object for creating a new appointment
 */
export interface IAppointmentCreate {
  startsAt: Date | string;
  endsAt: Date | string;
  userId?: string;
  clientName?: string;
  serviceId: string;
  status?: AppointmentStatus;
}

/**
 * Appointment Update DTO
 *
 * Data Transfer Object for updating appointment information
 */
export interface IAppointmentUpdate {
  startsAt?: Date | string;
  endsAt?: Date | string;
  status?: AppointmentStatus;
  clientName?: string;
}

/**
 * Appointment Query Parameters
 *
 * Query parameters for filtering appointments
 */
export interface IAppointmentQuery {
  status?: AppointmentStatus;
  userId?: string;
  serviceId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

/**
 * Available Slot Interface
 *
 * Represents an available time slot for booking
 */
export interface IAvailableSlot {
  startsAt: Date | string;
  endsAt: Date | string;
  available: boolean;
}

/**
 * Appointment Statistics Interface
 *
 * Statistics about appointments
 */
export interface IAppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  canceled: number;
  noShow: number;
}
