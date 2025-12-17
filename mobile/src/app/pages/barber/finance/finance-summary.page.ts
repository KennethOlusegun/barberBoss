import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-barber-finance-summary',
  templateUrl: './finance-summary.page.html',
  styleUrls: ['./finance-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, MatIconModule],
})
export class FinanceSummaryPage implements OnInit {
  financeSummary: any = null;
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.fetchFinanceSummary();
  }

  fetchFinanceSummary() {
    this.loading = true;
    this.error = '';
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.apiService
          .get<any>('/finance-report/summary', {
            params: { barberId: user.id },
            requiresAuth: true,
          })
          .subscribe({
            next: (result) => {
              this.financeSummary = result;
              this.loading = false;
            },
            error: () => {
              this.error = 'Erro ao buscar relatório financeiro';
              this.loading = false;
            },
          });
      },
      error: () => {
        this.error = 'Erro ao buscar usuário';
        this.loading = false;
      },
    });
  }
}
