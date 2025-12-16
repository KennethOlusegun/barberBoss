import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserRole } from 'src/app/core/services/auth/auth.types';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterPage {
  form = {
    name: '',
    email: '',
    password: '',
    role: UserRole.CLIENT,
  };
  submitted = false;
  loading = false;
  errorMsg = '';
  roles = [
    { label: 'Cliente', value: UserRole.CLIENT },
    { label: 'Barbeiro', value: UserRole.BARBER },
    { label: 'Administrador', value: UserRole.ADMIN },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  onSubmit(): void {
    this.submitted = true;
    this.errorMsg = '';
    if (
      !this.form.name ||
      !this.form.email ||
      !this.form.password ||
      this.form.password.length < 6
    ) {
      return;
    }
    this.loading = true;
    console.log('Enviando dados para cadastro:', this.form);
    this.authService.register(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Cadastro realizado com sucesso:', res);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro ao cadastrar usuário:', err);
        this.errorMsg =
          err?.error?.message || err?.message || 'Erro ao cadastrar usuário.';
        alert('Erro ao cadastrar usuário: ' + this.errorMsg);
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
