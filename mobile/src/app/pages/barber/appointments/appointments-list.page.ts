import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from './appointments.service';
import type { Appointment } from './appointments.service';
import { AuthService } from 'src/app/core/services/auth';
import type { User } from 'src/app/core/services/auth';
import { CommonModule, NgIf, NgForOf, DatePipe, SlicePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular'; // <--- IMPORTANTE: Adicionado

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  // Adicionei IonicModule aqui nos imports
  imports: [CommonModule, NgIf, NgForOf, DatePipe, MatIconModule, SlicePipe, IonicModule], 
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>MEUS AGENDAMENTOS</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <div *ngIf="loading" class="status-msg">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Carregando...</p>
      </div>
      
      <div *ngIf="error" class="status-msg error">
        <mat-icon>error_outline</mat-icon>
        <p>Erro ao carregar dados.</p>
      </div>

      <div *ngIf="!loading && !appointments.length" class="status-msg empty">
        <mat-icon>event_busy</mat-icon>
        <p>Nenhum agendamento encontrado.</p>
      </div>

      <div class="cards-list" *ngIf="!loading && appointments.length">
        
        <div class="appointment-card" *ngFor="let ag of appointments">
          <div class="card-header">
            <span class="service-name">{{ ag.service?.name || 'Serviço #' + (ag.serviceId | slice:0:8) }}</span>
            <span class="date-badge">
              {{ ag.startsAt | date: 'dd/MM HH:mm' }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <mat-icon>person</mat-icon>
              <span class="client-name">
                {{ ag.clientName || (ag.userId ? 'ID: ' + (ag.userId | slice:0:8) + '...' : 'Cliente Desconhecido') }}
              </span>
            </div>
            
            <div class="info-row status-row">
              <span class="status-badge" [ngClass]="ag.status">
                {{ translateStatus(ag.status) }}
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn edit" (click)="edit(ag)">
              <mat-icon>edit</mat-icon> Editar
            </button>
            <button class="action-btn delete" (click)="delete(ag)">
              <mat-icon>delete</mat-icon> Excluir
            </button>
          </div>
        </div>

        <div class="spacer-bottom"></div>

      </div>
    </ion-content>
  `,
  styles: [
    `
      /* Header Transparente com Título Centralizado */
      ion-toolbar {
        --background: transparent;
        --color: #fff;
        text-align: center;
        padding-top: 10px;
      }

      ion-title {
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 1px;
      }

      /* Ajuste do conteúdo */
      ion-content {
        --background: #0f172a; /* Fundo global escuro */
      }

      .status-msg {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        padding: 4rem 1rem;
        gap: 1rem;
        
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          opacity: 0.5;
        }
      }
      .status-msg.error { color: #ef4444; }

      /* Lista */
      .cards-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-bottom: 20px;
      }

      /* Espaçador final para o botão + */
      .spacer-bottom {
        height: 80px; 
        width: 100%;
      }

      /* Card */
      .appointment-card {
        background-color: #1e293b;
        border-radius: 16px;
        padding: 1.25rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .service-name {
        color: #fff;
        font-weight: 600;
        font-size: 1.1rem;
      }

      .date-badge {
        background: rgba(59, 130, 246, 0.2);
        color: #60a5fa;
        padding: 0.35rem 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .card-body {
        margin-bottom: 1.25rem;
      }

      .info-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        color: #cbd5e1;
      }

      .info-row mat-icon {
        color: #94a3b8;
      }

      .status-badge {
        font-size: 0.8rem;
        padding: 0.35rem 1rem;
        border-radius: 9999px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      /* Cores dos Status */
      .PENDING { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }
      .CONFIRMED { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
      .CANCELED { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      .COMPLETED { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }

      /* Ações */
      .card-actions {
        display: flex;
        gap: 1rem;
      }

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .action-btn:active { opacity: 0.8; }

      .action-btn.edit {
        background: #334155;
        color: #fff;
      }
      .action-btn.delete {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
      }
    `,
  ],
})
export class AppointmentsListPage implements OnInit {
  appointments: Appointment[] = [];
  loading = false;
  error = false;
  user: User | null = null;

  constructor(
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.fetch(user.id);
      } else {
        this.appointments = [];
      }
    });
  }

  fetch(barberId: string) {
    this.loading = true;
    this.error = false;
    this.appointmentsService.getAll({ limit: 20, barberId }).subscribe({
      next: (res) => {
        this.appointments = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  edit(ag: Appointment) {
    alert('Funcionalidade de editar: ' + ag.id);
  }

  delete(ag: Appointment) {
    if (confirm('Deseja realmente excluir este agendamento?')) {
      if (this.user) {
        this.appointmentsService
          .delete(ag.id)
          .subscribe(() => this.fetch(this.user!.id));
      }
    }
  }

  translateStatus(status: string): string {
    const map: any = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'CANCELED': 'Cancelado',
      'COMPLETED': 'Concluído',
      'NO_SHOW': 'Não Compareceu'
    };
    return map[status] || status;
  }
}