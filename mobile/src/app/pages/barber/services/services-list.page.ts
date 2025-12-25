import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
// CORREÇÃO 1: Import local (./) pois o serviço está na mesma pasta que a lista
import { ServicesService, Service } from './services.service';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.page.html',
  styleUrls: ['./services-list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule, MatIconModule],
})
export class ServicesListPage implements OnInit, OnDestroy {
  services: Service[] = [];
  filteredServices: Service[] = [];
  isLoading: boolean = false;
  activeSegment: 'services' | 'products' = 'services';
  searchQuery: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadServices(): void {
    this.isLoading = true;
    this.servicesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Service[]) => {
          this.services = data || [];
          this.updateFilteredServices();
          this.isLoading = false;
        },
        // CORREÇÃO 2: Tipagem explícita 'any' para evitar erro TS7006
        error: (error: any) => {
          console.error('Erro ao carregar serviços:', error);
          this.services = [];
          this.filteredServices = [];
          this.isLoading = false;
        },
      });
  }

  private updateFilteredServices(): void {
    if (!this.searchQuery.trim()) {
      this.filteredServices = [...this.services];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredServices = this.services.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          (service.description?.toLowerCase().includes(query) ?? false)
      );
    }
  }

  onRefresh(event: RefresherCustomEvent): void {
    this.loadServices();
    event.target.complete();
  }

  openSearch(): void {
    console.log('Abrir busca');
  }

  onSegmentChange(): void {
    console.log('Segmento ativo:', this.activeSegment);
  }

  trackByServiceId(index: number, service: Service): string {
    return service.id;
  }

  // --- CORREÇÃO DE CRASH E FOCO ---

  navigateToCreate(): void {
    // 1. Remove o foco do botão (evita o erro 'descendant retained focus')
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 2. Aguarda 50ms para o navegador processar o blur antes de navegar
    // Isso evita o crash 'Gn.setFocus'
    setTimeout(() => {
      this.router.navigate(['/barber/services/new']);
    }, 50);
  }

  navigateToEdit(serviceId: string): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setTimeout(() => {
      this.router.navigate(['/barber/services/edit', serviceId]);
    }, 50);
  }
}