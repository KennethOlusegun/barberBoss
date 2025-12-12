import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-barber-finance-summary',
  templateUrl: './finance-summary.page.html',
  styleUrls: ['./finance-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class FinanceSummaryPage implements OnInit {
  total: number = 0;
  completed: number = 0;
  pending: number = 0;
  appointments: any[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit() {
    this.fetchFinanceSummary();
  }

  fetchFinanceSummary() {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.apiService.get<any>('/appointments', { params: { barberId: user.id, limit: 100 }, requiresAuth: true })
          .subscribe({
            next: (result) => {
              let ags: any[] = [];
              if (Array.isArray(result)) {
                ags = result;
              } else if (result && Array.isArray(result.data)) {
                ags = result.data;
              }
              this.appointments = ags;
              this.completed = ags.filter(a => a.status === 'COMPLETED').reduce((sum, a) => sum + (a.service?.price || 0), 0);
              this.pending = ags.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').reduce((sum, a) => sum + (a.service?.price || 0), 0);
              this.total = this.completed + this.pending;
              this.loading = false;
            },
            error: () => {
              this.error = 'Erro ao buscar dados financeiros';
              this.loading = false;
            }
          });
      },
      error: () => {
        this.error = 'Erro ao buscar usuário';
        this.loading = false;
      }
    });
  }
}
