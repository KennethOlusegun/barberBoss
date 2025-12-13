import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { Service } from 'src/app/core/models/service.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-services-list',
  templateUrl: './services-list.page.html',
  styleUrls: ['./services-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ServicesListPage implements OnInit {
  services: Service[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchServices();
  }

  fetchServices() {
    this.loading = true;
    this.apiService.get<any>('/services', { params: { limit: 100 }, requiresAuth: true })
      .subscribe({
        next: (result) => {
          if (Array.isArray(result)) {
            this.services = result.map((s: any) => new Service(s));
          } else if (result && Array.isArray(result.data)) {
            this.services = result.data.map((s: any) => new Service(s));
          } else {
            this.services = [];
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao buscar serviços';
          this.loading = false;
        }
      });
  }
}
