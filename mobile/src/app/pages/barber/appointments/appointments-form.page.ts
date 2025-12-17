import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentsService } from './appointments.service';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth';
import type { User } from 'src/app/core/services/auth';

import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments-form',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, ReactiveFormsModule],
  template: `
    <div class="appointments-form">
      <h2 class="title">Novo Agendamento</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Cliente cadastrado</label>
          <select
            formControlName="userId"
            [disabled]="form.get('clientName')?.value"
          >
            <option value="">Selecione...</option>
            <option *ngFor="let c of clients" [value]="c.id">
              {{ c.name }} ({{ c.email }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Cliente (nome manual)</label>
          <input
            formControlName="clientName"
            placeholder="Nome do cliente"
            [disabled]="form.get('userId')?.value"
          />
        </div>
        <div class="form-group">
          <label>Serviço</label>
          <select formControlName="serviceId">
            <option value="" disabled selected>Selecione...</option>
            <option *ngFor="let s of services" [value]="s.id">
              {{ s.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Data/Hora</label>
          <input type="datetime-local" formControlName="startsAt" />
        </div>
        <button type="submit" [disabled]="form.invalid || loading">
          Salvar
        </button>
        <div *ngIf="error" class="error">Erro ao salvar agendamento</div>
      </form>
    </div>
  `,
  styles: [
    `
      .appointments-form {
        max-width: 400px;
        margin: 2rem auto;
        background: #1e293b;
        padding: 2rem;
        border-radius: 12px;
        color: #fff;
      }
      .title {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .form-group {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #94a3b8;
      }
      input,
      select {
        width: 100%;
        padding: 0.5rem;
        border-radius: 6px;
        border: none;
        background: #232a36;
        color: #fff;
      }
      button {
        width: 100%;
        padding: 0.75rem;
        background: #3b82f6;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        margin-top: 1rem;
      }
      .error {
        color: #ef4444;
        text-align: center;
        margin-top: 1rem;
      }
    `,
  ],
})
export class AppointmentsFormPage implements OnInit {
  form: FormGroup;
  services: Array<{ id: string; name: string }> = [];
  clients: Array<{ id: string; name: string; email: string }> = [];
  loading: boolean = false;
  error: boolean = false;
  user: User | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService,
    private api: ApiService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      userId: [''],
      clientName: [''],
      serviceId: ['', Validators.required],
      startsAt: ['', Validators.required],
    });
    this.authService.user$.subscribe((user) => (this.user = user));
  }

  ngOnInit() {
    this.api.get('/services').subscribe({
      next: (res: any) => {
        this.services = res.data || res;
      },
      error: () => {
        this.services = [];
      },
    });
    // Buscar clientes cadastrados
    this.api
      .get('/users', { params: { role: 'CLIENT', limit: 100 } })
      .subscribe({
        next: (res: any) => {
          this.clients = res.data || res;
        },
        error: () => {
          this.clients = [];
        },
      });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = false;
    // Montar payload correto
    const { userId, clientName, ...rest } = this.form.value;
    let payload: any = { ...rest };
    if (userId) {
      payload.userId = userId;
    } else if (clientName) {
      payload.clientName = clientName;
    }
    // Adiciona barberId do usuário logado
    if (this.user) {
      payload.barberId = this.user.id;
    }
    this.appointmentsService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/barber/appointments']);
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }
}
