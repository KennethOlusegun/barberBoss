import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginCredentials } from '../../../core/services/auth/auth.types';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  emailFocused = false;
  passwordFocused = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.initForm();

    // Garantir que isLoading está false
    this.isLoading = false;

    // Forçar habilitação dos campos após render
    setTimeout(() => {
      this.loginForm.enable();
    }, 100);
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    try {
      // Executa o Observable do login corretamente
      const { firstValueFrom } = await import('rxjs');
      await firstValueFrom(this.authService.login(credentials));
      this.router.navigate(['/tabs/tab1']);
    } catch (error: any) {
      this.errorMessage =
        error?.error?.message ||
        'Erro ao fazer login. Verifique suas credenciais.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }

    if (field?.hasError('email')) {
      return 'Email inválido';
    }

    if (field?.hasError('minlength')) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }

    return '';
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
