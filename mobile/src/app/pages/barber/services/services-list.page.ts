import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
// CORREÇÃO 1: Importamos a Interface do arquivo correto (services.service.ts)
import { Service } from './services.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-services-list',
  templateUrl: './services-list.page.html',
  styleUrls: ['./services-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ServicesListPage implements OnInit {
  // Inicializa como array vazio da Interface Service
  services: Service[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchServices();
  }

  fetchServices() {
    this.loading = true;
    this.apiService
      // CORREÇÃO 2: Removemos parâmetros desnecessários se não usados
      .get<any>('/services', { params: { limit: 100 }, requiresAuth: true })
      .subscribe({
        next: (result) => {
          // CORREÇÃO 3: Verificamos o formato e atribuímos DIRETO (sem 'new Service')
          if (Array.isArray(result)) {
            this.services = result;
          } else if (result && Array.isArray(result.data)) {
            this.services = result.data;
          } else {
            this.services = [];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erro ao buscar serviços';
          this.loading = false;
        },
      });
  }
}