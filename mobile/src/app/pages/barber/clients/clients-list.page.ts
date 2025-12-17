import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';
import { User } from 'src/app/core/models/user.model';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-clients-list',
  templateUrl: './clients-list.page.html',
  styleUrls: ['./clients-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, MatIconModule],
})
export class ClientsListPage implements OnInit {
  clients: User[] = [];
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.fetchClients();
  }

  /**
   * Busca a lista de clientes
   */
  fetchClients() {
    this.loading = true;
    this.error = '';

    this.apiService
      .get<any>('/users', {
        params: { role: 'CLIENT', limit: 100 },
        requiresAuth: true,
      })
      .subscribe({
        next: (result) => {
          if (Array.isArray(result)) {
            this.clients = result.map((u: any) => new User(u));
          } else if (result && Array.isArray(result.data)) {
            this.clients = result.data.map((u: any) => new User(u));
          } else {
            this.clients = [];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao buscar clientes:', err);
          this.error = 'Erro ao buscar clientes. Tente novamente.';
          this.loading = false;
          this.showToast('Erro ao carregar clientes', 'danger');
        },
      });
  }

  /**
   * Deleta um cliente com confirmação
   */
  async deleteClient(client: User) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente deletar o cliente <strong>${client.getFullName()}</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Deletar',
          role: 'destructive',
          handler: () => {
            this.performDelete(client);
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Executa a exclusão do cliente
   */
  private performDelete(client: User) {
    this.loading = true;

    this.apiService
      .delete(`/users/${client.id}`, { requiresAuth: true })
      .subscribe({
        next: () => {
          this.clients = this.clients.filter((c) => c.id !== client.id);
          this.loading = false;
          this.showToast(
            `Cliente ${client.getFullName()} deletado com sucesso`,
            'success',
          );
        },
        error: (err) => {
          console.error('Erro ao deletar cliente:', err);
          this.error = 'Erro ao deletar cliente';
          this.loading = false;
          this.showToast('Erro ao deletar cliente. Tente novamente.', 'danger');
        },
      });
  }

  /**
   * Handler para o ion-refresher
   */
  handleRefresh(event: any) {
    this.fetchClients();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * Exibe um toast de feedback
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }
}
