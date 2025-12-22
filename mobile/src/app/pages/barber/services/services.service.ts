import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { Observable } from 'rxjs';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number; // Backend usa durationMin, o form usa duration (faremos a conversão)
  barberCommission: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Service[]> {
    return this.api.get('/services');
  }

  getById(id: string): Observable<Service> {
    return this.api.get(`/services/${id}`);
  }

  create(data: any): Observable<Service> {
    // Conversão de nomes se necessário (duration -> durationMin)
    const payload = {
      ...data,
      durationMin: data.duration, // Mapeia o campo do form para a API
    };
    delete payload.duration;

    return this.api.post('/services', payload);
  }

  update(id: string, data: any): Observable<Service> {
    const payload = {
      ...data,
      durationMin: data.duration,
    };
    delete payload.duration;

    return this.api.patch(`/services/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/services/${id}`);
  }
}
