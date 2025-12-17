import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { Observable } from 'rxjs';

export interface Appointment {
  id: string;
  userId?: string;
  clientName?: string;
  serviceId: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  timezone?: string;
  service?: any;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  constructor(private api: ApiService) {}

  getAll(params: any = {}): Observable<{ data: Appointment[]; total: number }> {
    return this.api.get('/appointments', { params });
  }

  getById(id: string): Observable<Appointment> {
    return this.api.get(`/appointments/${id}`);
  }

  create(data: Partial<Appointment>): Observable<Appointment> {
    return this.api.post('/appointments', data);
  }

  update(id: string, data: Partial<Appointment>): Observable<Appointment> {
    return this.api.patch(`/appointments/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/appointments/${id}`);
  }
}
