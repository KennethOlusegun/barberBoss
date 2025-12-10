import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class ResetPasswordPage {
  resetForm = this.fb.group({
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  submit(): void {
    if (this.resetForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const token = this.resetForm.value.token ?? '';
    const newPassword = this.resetForm.value.newPassword ?? '';
    this.authService.confirmPasswordReset({ token, newPassword }).subscribe({
      next: () => {
        this.successMessage = 'Senha redefinida com sucesso!';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erro ao redefinir senha.';
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
