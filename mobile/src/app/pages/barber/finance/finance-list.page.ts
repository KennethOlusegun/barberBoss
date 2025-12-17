import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-finance-list',
  templateUrl: './finance-list.page.html',
  styleUrls: ['./finance-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class FinanceListPage implements OnInit {
  financeSummary: any = null;
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastController: ToastController,
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
              this.error = 'Erro ao buscar relatórios financeiros';
              this.loading = false;
              this.showToast('Erro ao carregar relatórios', 'danger');
            },
          });
      },
      error: () => {
        this.error = 'Erro ao buscar usuário';
        this.loading = false;
        this.showToast('Erro ao buscar usuário', 'danger');
      },
    });
  }

  handleRefresh(event: any) {
    this.fetchFinanceSummary();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }
}
