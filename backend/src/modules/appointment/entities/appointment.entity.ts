import {
  Appointment as PrismaAppointment,
  AppointmentStatus,
} from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Appointment implements PrismaAppointment {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  userId: string | null;
  clientName: string | null;
  barberId: string | null;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Appointment>) {
    Object.assign(this, partial);
  }
}
