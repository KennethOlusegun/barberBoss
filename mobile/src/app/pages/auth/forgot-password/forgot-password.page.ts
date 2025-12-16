import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class ForgotPasswordPage {
  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  submit(): void {
    if (this.forgotForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const email = this.forgotForm.value.email ?? '';
    this.authService.requestPasswordReset({ email }).subscribe({
      next: () => {
        this.successMessage =
          'E-mail de recuperação enviado! Verifique sua caixa de entrada.';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Erro ao solicitar recuperação de senha.';
        this.isLoading = false;
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
