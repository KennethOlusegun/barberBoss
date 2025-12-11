import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ApiService } from 'src/app/core/services/api/api.service';
import { User } from 'src/app/core/models/user.model';

import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, NgIf, IonicModule],
})
export class DashboardPage implements OnInit {
  agendamentosResumo = {
    total: 0,
    proximos: 0,
    concluidos: 0
  };
  perfil: any = {};
  loading = true;
  error?: string;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = undefined;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.perfil = { ...user };
        this.fetchResumoAgendamentos(user.id);
      },
      error: (err) => {
        this.error = 'Erro ao carregar perfil.';
        this.loading = false;
      }
    });
  }

  fetchResumoAgendamentos(userId: string) {
    // Busca todos os agendamentos do usuário logado
    this.apiService.get<any>(`/appointments`, {
      params: { userId, limit: 100 },
      requiresAuth: true
    }).subscribe({
      next: (result) => {
        const ags = result?.data || [];
        this.agendamentosResumo.total = ags.length;
        this.agendamentosResumo.proximos = ags.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
        this.agendamentosResumo.concluidos = ags.filter((a: any) => a.status === 'COMPLETED').length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar agendamentos.';
        this.loading = false;
      }
    });
  }
}
