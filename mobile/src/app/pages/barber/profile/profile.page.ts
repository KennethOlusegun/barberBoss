import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-barber-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatIconModule
  ],
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  loading = false; // 👈 COMEÇA COMO FALSE
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    });

    console.log('🏗️ ProfilePage constructor - loading inicial:', this.loading);
  }

  ngOnInit() {
    console.log('🔄 ProfilePage - ngOnInit');
    console.log('🔍 Loading no ngOnInit:', this.loading);

    // 🔥 GARANTIR QUE LOADING ESTÁ FALSE
    this.loading = false;
    this.cdr.detectChanges();

    console.log('✅ Loading forçado para FALSE:', this.loading);

    this.loadUserData();
  }

  async loadUserData() {
    console.log('📥 Carregando dados do usuário...');
    console.log('🔍 Loading antes de carregar:', this.loading);

    // 🔥 ESTRATÉGIA 1: Tenta carregar do localStorage PRIMEIRO
    const localUser = this.loadUserFromStorage();

    if (localUser) {
      console.log('✅ Dados do localStorage carregados (UI pronta)');
      console.log('📦 FormValue:', this.profileForm.value);

      this.loading = false;
      console.log('✅ Loading setado para FALSE:', this.loading);
      this.cdr.detectChanges();

      // Atualiza em background (opcional)
      setTimeout(() => this.refreshUserInBackground(), 100);
    } else {
      // 🔥 ESTRATÉGIA 2: Busca da API se não tiver localStorage
      console.log('⚠️ Sem dados no localStorage, buscando da API...');
      await this.fetchFromAPI();
    }
  }

  // 🔥 Carrega do localStorage SINCRONAMENTE
  private loadUserFromStorage(): any {
    try {
      const userJson = localStorage.getItem('barber_boss_user');

      if (!userJson) {
        console.warn('⚠️ localStorage vazio');
        return null;
      }

      const user = JSON.parse(userJson);
      console.log('📦 Dados do localStorage:', user);

      this.userId = user.id;
      console.log('🆔 userId definido:', this.userId);

      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });

      console.log('✅ Form atualizado com valores:', {
        name: this.profileForm.get('name')?.value,
        email: this.profileForm.get('email')?.value,
        phone: this.profileForm.get('phone')?.value
      });

      return user;
    } catch (error) {
      console.error('❌ Erro ao parsear localStorage:', error);
      return null;
    }
  }

  // 🔥 Busca da API usando async/await para garantir execução
  private async fetchFromAPI() {
    this.loading = true;
    this.cdr.detectChanges();

    try {
      console.log('🌐 Fazendo requisição HTTP para /auth/me...');

      const user = await firstValueFrom(this.authService.getCurrentUser());

      console.log('✅ Dados recebidos da API:', user);

      if (user) {
        this.userId = user.id;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        });
      }

      this.loading = false;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('❌ Erro ao buscar da API:', error);
      this.loading = false;
      this.cdr.detectChanges();

      // Se falhar, tenta localStorage como último recurso
      if (!this.userId) {
        this.loadUserFromStorage();
      }

      this.showToast('Erro ao carregar perfil', 'danger');
    }
  }

  // 🔥 Atualiza em background SEM bloquear UI
  private async refreshUserInBackground() {
    try {
      console.log('🔄 Atualizando em background...');
      const user = await firstValueFrom(this.authService.getCurrentUser());

      console.log('✅ Dados atualizados em background:', user);

      if (user && user.id === this.userId) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        });
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.warn('⚠️ Falha ao atualizar em background (não crítico):', error);
    }
  }

  async submit() {
    console.log('💾 Submit do formulário');

    if (this.profileForm.invalid) {
      console.warn('⚠️ Formulário inválido');
      this.showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    if (!this.userId) {
      console.error('❌ userId não encontrado');
      this.showToast('Erro: ID do usuário não encontrado', 'danger');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();

    const payload = { ...this.profileForm.value };
    console.log('📤 Payload:', payload);

    try {
      const response = await firstValueFrom(
        this.apiService.patch(`/users/${this.userId}`, payload, { requiresAuth: true })
      );

      console.log('✅ Perfil atualizado:', response);

      await loading.dismiss();
      this.loading = false;
      this.cdr.detectChanges();

      await this.showToast('Perfil atualizado com sucesso!', 'success');

      // Atualiza localStorage
      this.authService.refreshUser();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar:', error);

      await loading.dismiss();
      this.loading = false;
      this.cdr.detectChanges();

      const errorMessage = error?.error?.message || 'Erro ao atualizar perfil';
      await this.showToast(errorMessage, 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}
