import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api/api.service';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barber-client-form',
  templateUrl: './client-form.page.html',
  styleUrls: ['./client-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule]
})
export class ClientFormPage implements OnInit {
  clientForm: FormGroup;
  loading = false;
  isEdit = false;
  clientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.isEdit = true;
      this.loadClient();
    }
  }

  loadClient() {
    this.loading = true;
    this.apiService.get(`/users/${this.clientId}`, { requiresAuth: true }).subscribe({
      next: (data) => {
        this.clientForm.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone || ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  async submit() {
    if (this.clientForm.invalid) return;
    this.loading = true;
    const loading = await this.loadingCtrl.create({ message: this.isEdit ? 'Salvando...' : 'Cadastrando...' });
    await loading.present();
    const payload = { ...this.clientForm.value, role: 'CLIENT' };
    if (this.isEdit) {
      this.apiService.patch(`/users/${this.clientId}`, payload, { requiresAuth: true }).subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Cliente atualizado!', color: 'success', duration: 2000 });
          toast.present();
          this.router.navigate(['/barber/clients']);
        },
        error: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Erro ao atualizar cliente', color: 'danger', duration: 2000 });
          toast.present();
        }
      });
    } else {
      this.apiService.post('/users', payload, { requiresAuth: true }).subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Cliente cadastrado!', color: 'success', duration: 2000 });
          toast.present();
          this.router.navigate(['/barber/clients']);
        },
        error: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({ message: 'Erro ao cadastrar cliente', color: 'danger', duration: 2000 });
          toast.present();
        }
      });
    }
  }
}
