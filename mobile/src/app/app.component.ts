import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth/auth.service';

// IMPORTANTE: Importação do Plugin da Splash Screen
import { SplashScreen } from '@capacitor/splash-screen';

import {
  IonApp,
  IonMenu,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonButton,
  IonFab,
  IonFabButton,
  IonRouterOutlet,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    IonApp,
    IonMenu,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonSearchbar,
    IonButton,
    IonFab,
    IonFabButton,
    IonRouterOutlet,
    IonLabel,
    NgForOf,
    NgIf
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true
})
export class AppComponent implements OnInit {
  appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
    { title: 'Agendamentos', url: '/barber/appointments', icon: 'event' },
    { title: 'Clientes', url: '/barber/clients', icon: 'group' },
    { title: 'Serviços', url: '/barber/services', icon: 'content_cut' },
    { title: 'Financeiro', url: '/barber/finance', icon: 'attach_money' },
    { title: 'Perfil', url: '/barber/profile', icon: 'account_circle' },
  ];
  selectedPath = '';
  showFab = false;
  isPublicPage = false;

  private publicRoutes = ['/login', '/register', '/forgot-password'];

  constructor(
    private router: Router,
    private location: Location,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.selectedPath = event.urlAfterRedirects;
        this.showFab = this.selectedPath.startsWith('/barber/appointments');
        this.isPublicPage = this.publicRoutes.some(route => this.selectedPath.includes(route));

        // 🔥 LIMPADOR AUTOMÁTICO: Remove loadings travados a cada navegação
        this.cleanupStuckLoadings();
      });
  }

  async ngOnInit() {
    await this.configureStatusBar();

    // CORREÇÃO: Esconde a Splash Screen assim que o Angular inicia
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.warn('SplashScreen hide falhou ou não está disponível (web mode):', e);
    }

    // 🔥 HEALTH CHECK NÃO-BLOQUEANTE (sem loading!)
    // Roda em background sem travar a UI
    this.checkBackendConnectionSilent();

    // 🔥 LIMPEZA INICIAL: Remove qualquer loading preso ao iniciar
    setTimeout(() => this.cleanupStuckLoadings(), 1000);
  }

  private async configureStatusBar() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.warn('StatusBar plugin não disponível (web mode)');
    }
  }

  // 🔥 HEALTH CHECK SILENCIOSO - NÃO cria loading!
  private async checkBackendConnectionSilent() {
    try {
      console.log('🔍 Verificando conexão com backend (background - sem loading)...');

      const response = await fetch(environment.api.baseUrl + '/auth/me', {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '69420',
          'Authorization': `Bearer ${localStorage.getItem('barber_boss_token')}`
        },
      });

      if (response.ok) {
        console.log('✅ Backend conectado e acessível');
      } else {
        console.warn('⚠️ Backend respondeu com erro:', response.status);
        // 🔥 Toast discreto - NÃO bloqueia UI
        this.showConnectionToast('Problemas de conexão com servidor', 'warning');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar ao backend:', error);
      // 🔥 Toast discreto - NÃO bloqueia UI
      this.showConnectionToast('Servidor offline - funcionando no modo cache', 'danger');
    }
  }

  // 🔥 NOVO: Remove loadings/backdrops travados automaticamente
  private cleanupStuckLoadings() {
    setTimeout(() => {
      const stuckElements = document.querySelectorAll('ion-loading, ion-backdrop');

      if (stuckElements.length > 0) {
        console.warn('⚠️ [AppComponent] Encontrados', stuckElements.length, 'elementos travados. Removendo...');

        stuckElements.forEach((el) => {
          console.log('🗑️ Removendo:', el.tagName);
          el.remove();
        });

        console.log('✅ Limpeza de loadings concluída');
      }
    }, 500); // Aguarda 500ms após navegação para limpar
  }

  // 🔥 Toast discreto - NÃO usa loading bloqueante
  private async showConnectionToast(message: string, color: 'warning' | 'danger') {
    try {
      const toast = await this.toastController.create({
        message,
        color,
        duration: 3000,
        position: 'bottom',
        buttons: [{ text: 'OK', role: 'cancel' }]
      });
      await toast.present();
    } catch (error) {
      console.error('Erro ao exibir toast:', error);
    }
  }

  onFabClick() {
    this.router.navigate(['/barber/appointments/create']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
