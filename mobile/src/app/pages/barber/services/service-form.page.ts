import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api/api.service';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Service } from 'src/app/core/models/service.model';

@Component({
  selector: 'app-barber-service-form',
  templateUrl: './service-form.page.html',
  styleUrls: ['./service-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule]
})
export class ServiceFormPage implements OnInit {
  serviceForm: FormGroup;
  loading = false;
  isEdit = false;
  serviceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      durationMin: ['', Validators.required],
      price: ['']
    });
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.isEdit = true;
      this.loadService();
    }
  }

  loadService() {
    this.loading = true;
    this.apiService.get(`/services/${this.serviceId}`, { requiresAuth: true }).subscribe({
      next: (data) => {
        this.serviceForm.patchValue({
          name: data.name,
          durationMin: data.durationMin,
          price: data.price || ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  async submit() {
    if (this.serviceForm.invalid) return;
    this.loading = true;
    const loading = await this.loadingCtrl.create({ message: this.isEdit ? 'Salvando...' : 'Cadastrando...' });
    await loading.present();
    const payload = { ...this.serviceForm.value };
    if (this.isEdit) {
      this.apiService.patch(`/services/${this.serviceId}`, payload, { requiresAuth: true }).subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Serviço atualizado!', color: 'success', duration: 2000 });
          toast.present();
          this.router.navigate(['/barber/services']);
        },
        error: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Erro ao atualizar serviço', color: 'danger', duration: 2000 });
          toast.present();
        }
      });
    } else {
      this.apiService.post('/services', payload, { requiresAuth: true }).subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Serviço cadastrado!', color: 'success', duration: 2000 });
          toast.present();
          this.router.navigate(['/barber/services']);
        },
        error: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Erro ao cadastrar serviço', color: 'danger', duration: 2000 });
          toast.present();
        }
      });
    }
  }
}
