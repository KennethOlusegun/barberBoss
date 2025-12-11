import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ApiService } from 'src/app/core/services/api/api.service';
import { User } from 'src/app/core/models/user.model';

import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, IonicModule],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DashboardPage implements OnInit {
  agendamentos: any[] = [];
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
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = undefined;
    console.log('[Dashboard] Iniciando carregamento...');

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('[Dashboard] Usuário carregado:', user);
        this.perfil = { ...user };
        this.loading = false;
        this.cdr.detectChanges();
        this.fetchResumoAgendamentos(user.id);
      },
      error: (err) => {
        console.error('[Dashboard] Erro ao carregar usuário:', err);
        this.error = 'Erro ao carregar perfil.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchResumoAgendamentos(userId: string) {
    console.log('[Dashboard] Buscando agendamentos para userId:', userId);

    // Busca todos os agendamentos do usuário logado
    this.apiService.get<any>(`/appointments`, {
      params: { userId, limit: 100 },
      requiresAuth: true
    }).subscribe({
      next: (result) => {
        console.log('[Dashboard] Resposta recebida:', result);

        // A resposta já vem extraída, pode ser um array ou um objeto com { data, meta }
        let ags: any[] = [];
        if (Array.isArray(result)) {
          ags = result;
        } else if (result?.data && Array.isArray(result.data)) {
          ags = result.data;
        } else {
          ags = [];
        }

        console.log('[Dashboard] Agendamentos:', ags);

        this.agendamentos = ags;
        this.agendamentosResumo.total = ags.length;
        this.agendamentosResumo.proximos = ags.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
        this.agendamentosResumo.concluidos = ags.filter((a: any) => a.status === 'COMPLETED').length;

        console.log('[Dashboard] Resumo atualizado:', this.agendamentosResumo);
        console.log('[Dashboard] agendamentos.length:', this.agendamentos.length);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Dashboard] Erro ao carregar agendamentos:', err);
        this.error = 'Erro ao carregar agendamentos: ' + (err?.message || 'Desconhecido');
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('[Dashboard] Requisição de agendamentos completa');
      }
    });
  }
}
