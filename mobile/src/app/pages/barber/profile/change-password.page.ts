import { Component } from '@angular/core';
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

@Component({
  selector: 'app-barber-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule],
})
export class ChangePasswordPage {
  passwordForm: FormGroup;
  loading = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userId = user.id;
      },
    });
  }

  async submit() {
    if (this.passwordForm.invalid || !this.userId) return;
    this.loading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Alterando senha...',
    });
    await loading.present();
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    };
    this.apiService
      .patch(`/users/${this.userId}/change-password`, payload, {
        requiresAuth: true,
      })
      .subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Senha alterada com sucesso!',
            color: 'success',
            duration: 2000,
          });
          toast.present();
          this.passwordForm.reset();
        },
        error: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Erro ao alterar senha',
            color: 'danger',
            duration: 2000,
          });
          toast.present();
        },
      });
  }
}
