import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoadingController, AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
  IonAvatar,
  IonFab,
  IonFabButton,
  IonRouterOutlet, // <--- 1. IMPORTADO AQUI
} from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// StatusBar
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
    IonAvatar,
    IonFab,
    IonFabButton,
    IonRouterOutlet, // <--- 2. ADICIONADO AQUI
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
    private alertController: AlertController
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.selectedPath = event.urlAfterRedirects;
        this.showFab = this.selectedPath.startsWith('/barber/appointments');
        this.isPublicPage = this.publicRoutes.some(route => this.selectedPath.includes(route));
      });
  }

  async ngOnInit() {
    await this.configureStatusBar();
    await this.checkBackendConnection();
  }

  private async configureStatusBar() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark }); 
    } catch (error) {
      console.warn('StatusBar plugin não disponível (web mode)');
    }
  }

  private async checkBackendConnection() {
    const loading = await this.loadingController.create({
      message: 'Conectando ao servidor...',
      duration: 5000,
    });
    await loading.present();

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(environment.api.baseUrl + '/health', {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '69420',
        },
      });

      if (!response.ok) {
        throw new Error('Backend não respondeu');
      }

      console.log('✅ Backend conectado com sucesso');
      await loading.dismiss();

    } catch (error) {
      console.error('❌ Erro ao conectar ao backend:', error);
      await loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
        buttons: [
          {
            text: 'Tentar Novamente',
            handler: () => {
              window.location.reload();
            },
          },
          {
            text: 'Cancelar',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
    }
  }

  onFabClick() {
    this.router.navigate(['/barber/appointments/create']);
  }
}