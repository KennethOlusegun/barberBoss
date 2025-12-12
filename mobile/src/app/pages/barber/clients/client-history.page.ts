import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/core/services/api/api.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barber-client-history',
  templateUrl: './client-history.page.html',
  styleUrls: ['./client-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ClientHistoryPage implements OnInit {
  clientId: string | null = null;
  history: any[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.fetchHistory();
    }
  }

  fetchHistory() {
    this.loading = true;
    this.apiService.get<any>(`/appointments`, { params: { clientId: this.clientId, limit: 100 }, requiresAuth: true })
      .subscribe({
        next: (result) => {
          if (Array.isArray(result)) {
            this.history = result;
          } else if (result && Array.isArray(result.data)) {
            this.history = result.data;
          } else {
            this.history = [];
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Erro ao buscar histórico';
          this.loading = false;
        }
      });
  }
}
