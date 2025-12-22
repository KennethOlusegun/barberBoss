import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import {
  ToastController,
  LoadingController,
  IonicModule,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- Importante adicionar

@Component({
  selector: 'app-barber-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule, RouterModule], // <--- Adicionar RouterModule aqui
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  loading = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          console.log('Dados do usuário carregados:', user);
          this.userId = user.id;
          
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
          });
        }
      },
      error: (err) => console.error('Erro ao carregar usuário', err)
    });
  }

  async submit() {
    if (this.profileForm.invalid || !this.userId) return;
    this.loading = true;
    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();
    
    const payload = { ...this.profileForm.value };
    
    this.apiService
      .patch(`/users/${this.userId}`, payload, { requiresAuth: true })
      .subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Perfil atualizado!',
            color: 'success',
            duration: 2000,
            position: 'top'
          });
          toast.present();
          this.authService.refreshUser(); 
        },
        error: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Erro ao atualizar perfil',
            color: 'danger',
            duration: 2000,
            position: 'top'
          });
          toast.present();
        },
      });
  }
}