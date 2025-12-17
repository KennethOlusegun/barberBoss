import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from './appointments.service';
import type { Appointment } from './appointments.service';
import { AuthService } from 'src/app/core/services/auth';
import type { User } from 'src/app/core/services/auth';
import { CommonModule, NgIf, NgForOf, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, DatePipe, MatIconModule],
  template: `
    <div class="appointments-list">
      <h2 class="title">LISTA DE AGENDAMENTOS</h2>
      <div *ngIf="loading" class="loading">Carregando...</div>
      <div *ngIf="error" class="error">Erro ao carregar agendamentos</div>
      <table *ngIf="!loading && appointments.length" class="appointments-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Serviço</th>
            <th>Início</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let ag of appointments">
            <td>{{ ag.clientName || ag.userId }}</td>
            <td>{{ ag.service?.name || ag.serviceId }}</td>
            <td>{{ ag.startsAt | date: 'short' }}</td>
            <td>{{ ag.status }}</td>
            <td>
              <!-- Botões de ação: editar/excluir -->
              <button mat-icon-button color="primary" (click)="edit(ag)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(ag)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!loading && !appointments.length" class="empty">
        Nenhum agendamento encontrado.
      </div>
    </div>
  `,
  styles: [
    `
      .appointments-list {
        padding: 2rem;
      }
      .title {
        color: #fff;
        text-align: center;
        margin-bottom: 2rem;
      }
      .loading,
      .error,
      .empty {
        color: #94a3b8;
        text-align: center;
        margin-top: 2rem;
      }
      .appointments-table {
        width: 100%;
        background: #1e293b;
        color: #fff;
        border-radius: 8px;
        overflow: hidden;
      }
      th,
      td {
        padding: 0.75rem 1rem;
        text-align: left;
      }
      th {
        background: #232a36;
      }
      tr:nth-child(even) {
        background: #232a36;
      }
      button[mat-icon-button] {
        margin-right: 0.5rem;
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
    // Obter usuário logado e buscar agendamentos do barbeiro
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
    // TODO: Navegar para tela de edição
    alert('Editar: ' + ag.id);
  }

  delete(ag: Appointment) {
    if (confirm('Deseja excluir este agendamento?')) {
      if (this.user) {
        this.appointmentsService
          .delete(ag.id)
          .subscribe(() => this.fetch(this.user!.id));
      }
    }
  }
}
