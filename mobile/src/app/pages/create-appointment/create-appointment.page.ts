import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NavController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { ApiService } from 'src/app/core/services/api/api.service';
import { Service } from 'src/app/core/models/service.model';
import { User } from 'src/app/core/models/user.model';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.page.html',
  styleUrls: ['./create-appointment.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule],
})
export class CreateAppointmentPage implements OnInit {
  appointmentForm: FormGroup;
  services: Service[] = [];
  barbers: User[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) {
    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      serviceId: ['', Validators.required],
      barberId: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit() {
    this.fetchServices();
    this.fetchBarbers();
  }
  async fetchBarbers() {
    try {
      const result = await this.apiService
        .get<any>('/users', {
          params: { role: 'BARBER', limit: 100 },
          requiresAuth: false,
        })
        .toPromise();
      console.log('[DEBUG] Resultado da busca de barbeiros:', result);
      if (Array.isArray(result)) {
        this.barbers = result.map((u: any) => new User(u));
      } else if (result && Array.isArray(result.data)) {
        this.barbers = result.data.map((u: any) => new User(u));
      } else {
        this.barbers = [];
      }
      console.log('[DEBUG] Barbeiros carregados:', this.barbers);
    } catch (err) {
      console.error('[DEBUG] Erro ao buscar barbeiros:', err);
      this.barbers = [];
    }
  }

  async fetchServices() {
    this.loading = true;
    try {
      const result = await this.apiService
        .get<any>('/services', { params: { limit: 100 }, requiresAuth: false })
        .toPromise();
      if (Array.isArray(result)) {
        this.services = result.map((s: any) => new Service(s));
      } else if (result && Array.isArray(result.data)) {
        this.services = result.data.map((s: any) => new Service(s));
      } else {
        this.services = [];
      }
    } catch (err) {
      this.services = [];
    } finally {
      this.loading = false;
    }
  }

  async submit() {
    if (this.appointmentForm.invalid) return;

    const { date, time, serviceId, barberId, notes } =
      this.appointmentForm.value;

    // Validar domingo ANTES de enviar para o backend
    const isDomingo = this.verificarDomingo(date);
    if (isDomingo) {
      const toast = await this.toastCtrl.create({
        message: 'Não é possível agendar para domingo. Escolha outro dia.',
        color: 'danger',
        duration: 2500,
      });
      toast.present();
      return;
    }

    // Montar startsAt no formato correto (sempre como horário de Brasília)
    const startsAt = this.combineDateTime(date, time);

    const payload: any = {
      serviceId,
      barberId,
      startsAt,
      timezone: 'America/Sao_Paulo', // Sempre Brasília
      notes: notes || undefined,
    };

    const loading = await this.loadingCtrl.create({ message: 'Agendando...' });
    await loading.present();

    this.apiService
      .post('/appointments', payload, { requiresAuth: true })
      .subscribe({
        next: async (res) => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Agendamento criado com sucesso!',
            color: 'success',
            duration: 2000,
          });
          toast.present();
          this.navCtrl.back();
        },
        error: async (err) => {
          await loading.dismiss();
          let msg = 'Erro ao criar agendamento';
          if (err && err.message) {
            msg = err.message;
          }
          const toast = await this.toastCtrl.create({
            message: msg,
            color: 'danger',
            duration: 2500,
          });
          toast.present();
        },
      });
  }

  /**
   * Verifica se a data selecionada é domingo
   */
  verificarDomingo(date: string): boolean {
    let year: number, month: number, day: number;

    if (date.includes('-')) {
      // Formato: YYYY-MM-DD
      [year, month, day] = date.split('-').map(Number);
    } else {
      // Formato: DD/MM/YYYY
      [day, month, year] = date.split('/').map(Number);
    }

    const jsDate = new Date(year, month - 1, day);
    return jsDate.getDay() === 0;
  }

  /**
   * Combina data e hora no formato que o backend espera
   * IMPORTANTE: O horário selecionado pelo usuário é SEMPRE interpretado
   * como horário de Brasília, independente do fuso horário do dispositivo
   *
   * @param date - Data no formato 'YYYY-MM-DD' ou 'DD/MM/YYYY'
   * @param time - Hora no formato 'HH:mm'
   * @returns String no formato ISO 8601 LOCAL (sem Z), ex: '2025-12-12T14:00:00'
   */
  combineDateTime(date: string, time: string): string {
    let year: number, month: number, day: number;

    // Parse da data
    if (date.includes('-')) {
      // Formato: YYYY-MM-DD
      [year, month, day] = date.split('-').map(Number);
    } else {
      // Formato: DD/MM/YYYY
      [day, month, year] = date.split('/').map(Number);
    }

    // Parse da hora
    const [h, m] = time.split(':').map(Number);

    // Formatar componentes com zero à esquerda
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');

    // Retornar no formato ISO 8601 LOCAL (sem timezone, sem Z)
    // O backend vai interpretar isso como horário de Brasília
    // Exemplo: se usuário escolheu 14:00, envia '2025-12-12T14:00:00'
    return `${year}-${monthStr}-${dayStr}T${hStr}:${mStr}:00`;
  }
}
