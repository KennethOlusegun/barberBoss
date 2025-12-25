import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { ServicesService, Service } from '../services.service';

interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  priceType: 'fixed' | 'range';
  durationMin: number;
  category?: string;
  color?: string;
}

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.page.html',
  styleUrls: ['./service-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonicModule,
    MatIconModule
  ],
})
export class ServiceFormPage implements OnInit, OnDestroy {
  form: FormGroup;
  isEdit: boolean = false;
  isSubmitting: boolean = false;
  serviceId: string | null = null;

  durationOptions: number[] = [
    15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 240, 300
  ];

  colorOptions = [
    { name: 'Vermelho', hex: '#ef4444' },
    { name: 'Laranja', hex: '#f97316' },
    { name: 'Amarelo', hex: '#eab308' },
    { name: 'Verde', hex: '#22c55e' },
    { name: 'Azul', hex: '#3b82f6' },
    { name: 'Roxo', hex: '#a855f7' },
    { name: 'Rosa', hex: '#ec4899' },
    { name: 'Cinza', hex: '#64748b' },
  ];

  selectedCategory: string = '';
  selectedColor: string = '#3b82f6';
  selectedColorName: string = 'Azul';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.form = this.initializeForm();
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.serviceId;

    if (this.isEdit && this.serviceId) {
      this.loadService(this.serviceId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ========================================
     INICIALIZAÇÃO DO FORM
  ======================================== */
  private initializeForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      priceType: ['fixed', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      durationMin: [30, Validators.required],
      category: [''],
      color: ['#3b82f6'],
      description: ['', Validators.maxLength(500)],
    });
  }

  /* ========================================
     CARREGAMENTO DE SERVIÇO (EDIÇÃO)
  ======================================== */
  private loadService(id: string): void {
    this.servicesService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (service: Service) => {
          this.form.patchValue({
            name: service.name,
            description: service.description || '',
            price: service.price,
            priceType: service.priceType || 'fixed',
            durationMin: service.durationMin,
            category: service.category || '',
            color: service.color || '#3b82f6',
          });

          this.selectedCategory = service.category || '';
          this.setSelectedColor(service.color || '#3b82f6');
        },
        error: (error) => {
          console.error('Erro ao carregar serviço:', error);
          this.showToast('Erro ao carregar serviço', 'danger');
          this.router.navigate(['/barber/services']);
        },
      });
  }

  /* ========================================
     ✅ MÉTODO UTILITÁRIO: PREVINE FOCO E PROPAGAÇÃO
     (CRÍTICO PARA ANDROID)
  ======================================== */
  private preventFocusAndPropagate(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Remove foco de qualquer elemento ativo
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur();
    }
  }

  /* ========================================
     ✅ CLEAR FOCUS (LIMPA TODOS OS FOCOS ATIVOS)
  ======================================== */
  private clearFocus(): void {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
      
      // Remove foco de todos os inputs visíveis
      document.querySelectorAll('ion-input, ion-textarea, ion-select').forEach((el: any) => {
        if (el && typeof el.setBlur === 'function') {
          try {
            el.setBlur();
          } catch (e) {
            // Ignora erros se setBlur não estiver disponível
          }
        }
      });
    });
  }

  /* ========================================
     SUBMIT (SALVAR)
  ======================================== */
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast('Verifique os dados obrigatórios', 'warning');
      return;
    }

    // ✅ Limpa todos os focos antes de processar
    this.clearFocus();
    this.isSubmitting = true;

    const formData: ServiceFormData = {
      ...this.form.value,
      category: this.selectedCategory,
      color: this.selectedColor
    };

    const request$ = this.isEdit && this.serviceId
      ? this.servicesService.update(this.serviceId, formData)
      : this.servicesService.create(formData);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async () => {
          this.isSubmitting = false;
          const message = this.isEdit ? 'Serviço atualizado!' : 'Serviço criado!';
          await this.showToast(message, 'success');
          await this.navigateWithFocusManagement(['/barber/services']);
        },
        error: (error) => {
          console.error('Erro ao salvar:', error);
          this.isSubmitting = false;
          this.showToast('Erro ao salvar. Tente novamente.', 'danger');
        },
      });
  }

  /* ========================================
     DELETE (DELETAR)
  ======================================== */
  async onDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Deletar Serviço',
      message: 'Tem certeza que deseja remover este serviço?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Deletar',
          role: 'destructive',
          handler: () => { 
            this.deleteService(); 
          },
        },
      ],
    });
    await alert.present();
  }

  private deleteService(): void {
    if (!this.serviceId) return;
    
    this.clearFocus();
    this.isSubmitting = true;
    
    this.servicesService
      .delete(this.serviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async () => {
          this.isSubmitting = false;
          await this.showToast('Serviço removido', 'success');
          await this.navigateWithFocusManagement(['/barber/services']);
        },
        error: (error) => {
          console.error('Erro ao deletar:', error);
          this.isSubmitting = false;
          this.showToast('Erro ao deletar.', 'danger');
        },
      });
  }

  /* ========================================
     ✅ MODAL: CATEGORIA
  ======================================== */
  async openCategoryModal(event?: Event): Promise<void> {
    // ✅ Previne propagação e foco
    if (event) {
      this.preventFocusAndPropagate(event);
    }

    // ✅ Aguarda o navegador processar o blur
    await new Promise(resolve => requestAnimationFrame(resolve));

    const alert = await this.alertCtrl.create({
      header: 'Categoria',
      inputs: [
        { 
          type: 'radio', 
          label: 'Cabelo', 
          value: 'cabelo', 
          checked: this.selectedCategory === 'cabelo' 
        },
        { 
          type: 'radio', 
          label: 'Barba', 
          value: 'barba', 
          checked: this.selectedCategory === 'barba' 
        },
        { 
          type: 'radio', 
          label: 'Combo', 
          value: 'combo', 
          checked: this.selectedCategory === 'combo' 
        },
        { 
          type: 'radio', 
          label: 'Outros', 
          value: 'outros', 
          checked: this.selectedCategory === 'outros' 
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: (value) => {
            this.selectedCategory = value || '';
            this.form.patchValue({ category: this.selectedCategory });
          },
        },
      ],
    });
    
    await alert.present();
  }

  /* ========================================
     ✅ MODAL: COR NA AGENDA
  ======================================== */
  async openColorPicker(event?: Event): Promise<void> {
    // ✅ Previne propagação e foco
    if (event) {
      this.preventFocusAndPropagate(event);
    }

    // ✅ Aguarda o navegador processar o blur
    await new Promise(resolve => requestAnimationFrame(resolve));

    const alert = await this.alertCtrl.create({
      header: 'Cor na Agenda',
      inputs: this.colorOptions.map((color) => ({
        type: 'radio',
        label: color.name,
        value: color.hex,
        checked: this.selectedColor === color.hex
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: (value) => {
            if (value) this.setSelectedColor(value);
            this.form.patchValue({ color: value });
          },
        },
      ],
    });
    
    await alert.present();
  }

  /* ========================================
     AUXILIARES
  ======================================== */
  private setSelectedColor(hex: string): void {
    const color = this.colorOptions.find((c) => c.hex === hex);
    if (color) {
      this.selectedColor = color.hex;
      this.selectedColorName = color.name;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /* ========================================
     ✅ NAVEGAÇÃO COM GESTÃO DE FOCO
  ======================================== */
  private async navigateWithFocusManagement(path: string[]): Promise<void> {
    // 1. Limpa todos os focos
    this.clearFocus();
    
    // 2. Aguarda a próxima frame
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // 3. Navega
    await this.router.navigate(path);
  }

  /* ========================================
     TOAST (NOTIFICAÇÕES)
  ======================================== */
  private async showToast(
    message: string, 
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    await toast.present();
  }
}