import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { User } from 'src/app/core/models/user.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-clients-list',
  templateUrl: './clients-list.page.html',
  styleUrls: ['./clients-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ClientsListPage implements OnInit {
  clients: User[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.loading = true;
    this.apiService.get<any>('/users', { params: { role: 'CLIENT', limit: 100 }, requiresAuth: true })
      .subscribe({
        next: (result) => {
          if (Array.isArray(result)) {
            this.clients = result.map((u: any) => new User(u));
          } else if (result && Array.isArray(result.data)) {
            this.clients = result.data.map((u: any) => new User(u));
          } else {
            this.clients = [];
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao buscar clientes';
          this.loading = false;
        }
      });
  }
}
