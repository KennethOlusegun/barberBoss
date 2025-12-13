import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Barber {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class BarberService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getBarbers(): Observable<Barber[]> {
    // Busca todos usuários com role barber
    return this.http.get<Barber[]>(`${this.apiUrl}?role=barber`);
  }

  getBarber(id: string): Observable<Barber> {
    return this.http.get<Barber>(`${this.apiUrl}/${id}`);
  }

  createBarber(barber: Barber): Observable<Barber> {
    // Garante que o role seja barber
    return this.http.post<Barber>(this.apiUrl, { ...barber, role: 'barber' });
  }

  updateBarber(id: string, barber: Barber): Observable<Barber> {
    return this.http.put<Barber>(`${this.apiUrl}/${id}`, { ...barber, role: 'barber' });
  }

  deleteBarber(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
