import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { Observable } from 'rxjs';

// Interface atualizada para incluir os novos campos do formulário
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceType: 'fixed' | 'range'; // Adicionado
  durationMin: number;
  category?: string;            // Adicionado
  color?: string;               // Adicionado
  barberCommission?: number;
  active?: boolean;
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
    // O novo formulário (ServiceFormPage) já envia o objeto com 'durationMin',
    // então podemos passar os dados diretamente para a API.
    return this.api.post('/services', data);
  }

  update(id: string, data: any): Observable<Service> {
    // O mesmo vale para o update.
    return this.api.patch(`/services/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/services/${id}`);
  }
}
