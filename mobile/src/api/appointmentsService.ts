// src/api/appointmentsService.ts
import apiClient from './apiClient';
import { AxiosResponse } from 'axios';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface Service {
  id: string;
  name: string;
  duration?: number;
  price?: number;
}

export interface Barber {
  id: string;
  name: string;
  email?: string;
}

export interface Appointment {
  id: string;
  userId?: string;
  clientName?: string;
  serviceId: string;
  barberId?: string;
  startsAt: string;
  endsAt?: string;
  status: AppointmentStatus;
  timezone?: string;
  service?: Service;
  barber?: Barber;

  // Campos Financeiros (Declarados apenas uma vez)
  commissionPaid?: boolean; 
  finalPrice?: number;     
  price?: number;
  commission?: number;
  commissionType?: 'percent' | 'fixed';
  paymentMethod?: 'CASH' | 'CARD' | 'PIX';
  discount?: number;
  extraCharge?: number;
  serviceName?: string;
  barberName?: string;
}

export interface CreateAppointmentDTO {
  userId?: string;
  clientName?: string;
  serviceId: string;
  barberId: string;
  startsAt: string;
}

export interface UpdateAppointmentDTO {
  userId?: string;
  clientName?: string;
  serviceId?: string;
  barberId?: string;
  startsAt?: string;
  status?: AppointmentStatus;
  finalPrice?: number;
  commission?: number;
  commissionType?: 'percent' | 'fixed';
  paymentMethod?: 'CASH' | 'CARD' | 'PIX';
  discount?: number;
  extraCharge?: number;
}

export interface AppointmentsResponse {
  data: Appointment[];
  total: number;
}

const resource = '/appointments';

export const appointmentsService = {
  async updateFinancials(id: string, data: { finalPrice: number; barberCommission: number }): Promise<Appointment> {
    const res: AxiosResponse<Appointment> = await apiClient.patch(`${resource}/${id}/financials`, data);
    return res.data;
  },

  async markCommissionsAsPaid(barberId: string): Promise<void> {
    await apiClient.post(`/barbers/${barberId}/commissions/paid`);
  },

  async getBarbers(): Promise<Barber[]> {
    const res: AxiosResponse<Barber[]> = await apiClient.get('/users', { params: { role: 'BARBER' } });
    return res.data;
  },

  async getAll(params?: Record<string, any>): Promise<AppointmentsResponse> {
    const res: AxiosResponse<AppointmentsResponse> = await apiClient.get(resource, { params });
    return res.data;
  },

  async getById(id: string): Promise<Appointment> {
    const res: AxiosResponse<Appointment> = await apiClient.get(`${resource}/${id}`);
    return res.data;
  },

  async create(payload: CreateAppointmentDTO): Promise<Appointment> {
    const res: AxiosResponse<Appointment> = await apiClient.post(resource, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateAppointmentDTO): Promise<Appointment> {
    const res: AxiosResponse<Appointment> = await apiClient.put(`${resource}/${id}`, payload);
    return res.data;
  },

  async checkout(id: string, data: { paymentMethod: string; finalPrice: number; notes?: string }): Promise<Appointment> {
    const res: AxiosResponse<Appointment> = await apiClient.post(`${resource}/${id}/checkout`, data);
    return res.data;
  },

  async getClientSpending(clientId: string): Promise<{
    totalSpent: number;
    avgTicket: number;
    lastVisit: string;
    history: Appointment[];
    totalVisits?: number; // ✅ CORREÇÃO: Propriedade adicionada
  }> {
    const res: AxiosResponse<any> = await apiClient.get(`/clients/${clientId}/spending`);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
  },
};

export default appointmentsService;