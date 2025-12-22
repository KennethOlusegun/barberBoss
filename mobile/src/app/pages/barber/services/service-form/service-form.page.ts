import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../services.service';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.page.html',
  styleUrls: ['./service-form.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ServiceFormPage implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  serviceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      commission: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      active: [true]
    });
  }

  async ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.serviceId;

    if (this.isEdit && this.serviceId) {
      this.loading = true;
      const loading = await this.loadingCtrl.create({ message: 'Carregando...' });
      await loading.present();

      this.servicesService.getById(this.serviceId).subscribe({
        next: (service: any) => {
          this.form.patchValue({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.durationMin, // Backend usa durationMin
            commission: service.barberCommission, // Backend usa barberCommission
            active: service.active
          });
          this.loading = false;
          loading.dismiss();
        },
        error: () => {
          this.loading = false;
          loading.dismiss();
          this.showToast('Erro ao carregar serviço', 'danger');
          // CORREÇÃO: Rota ajustada para voltar à lista correta
          this.router.navigate(['/barber/services']);
        }
      });
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();

    const formData = this.form.value;
    
    // Mapeamento para o formato da API
    const payload = {
        ...formData,
        barberCommission: formData.commission
    };

    const request$ = (this.isEdit && this.serviceId)
      ? this.servicesService.update(this.serviceId, payload)
      : this.servicesService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        loading.dismiss();
        this.showToast(
          this.isEdit ? 'Serviço atualizado!' : 'Serviço criado!',
          'success'
        );
        // CORREÇÃO: Rota ajustada para voltar à lista correta
        this.router.navigate(['/barber/services']);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        loading.dismiss();
        this.showToast('Erro ao salvar. Verifique os dados.', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
}