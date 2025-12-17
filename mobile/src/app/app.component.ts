import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonButton,
  IonAvatar,
  IonFab,
  IonFabButton,
  IonFabList,
} from '@ionic/angular/standalone';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NgForOf,
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
  ],
})
export class AppComponent {
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

  constructor(
    private router: Router,
    private location: Location,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.selectedPath = event.urlAfterRedirects;
        // Exibe o FAB apenas na rota de agendamentos
        this.showFab = this.selectedPath.startsWith('/barber/appointments');
      });
  }

  onFabClick() {
    // Navega para a tela de criação de agendamento
    this.router.navigate(['/barber/appointments/create']);
  }
}
