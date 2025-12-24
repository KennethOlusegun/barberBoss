import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Loading Service
 *
 * Manages loading indicators throughout the application
 * Uses Ionic's LoadingController for consistent UI
 *
 * @example
 * constructor(private loadingService: LoadingService) {}
 *
 * // Show loading
 * await this.loadingService.show('Loading...');
 *
 * // Hide loading
 * await this.loadingService.hide();
 *
 * // Check loading state
 * this.loadingService.isLoading$.subscribe(isLoading => {
 *   console.log('Loading:', isLoading);
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loading: HTMLIonLoadingElement | null = null;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;
  private maxRequestCount = 100; // 🔥 NOVO: Prevenir overflow
  private autoCleanupTimeout: any = null; // 🔥 NOVO: Timer de segurança

  /**
   * Observable that emits the current loading state
   */
  public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private loadingController: LoadingController) {
    // 🔥 NOVO: Limpeza automática a cada 30 segundos
    this.startAutoCleanup();
  }

  /**
   * Show loading indicator
   * @param message Optional loading message
   * @param duration Optional duration in milliseconds (0 = indefinite)
   */
  async show(message?: string, duration: number = 0): Promise<void> {
    try {
      this.requestCount++;

      // 🔥 NOVO: Prevenir overflow de requisições
      if (this.requestCount > this.maxRequestCount) {
        console.warn('⚠️ RequestCount muito alto! Resetando...');
        this.requestCount = 1;
        await this.forceCleanup();
      }

      console.log('📊 LoadingService.show() - requestCount:', this.requestCount);

      // Se loading já está sendo exibido, apenas atualiza mensagem
      if (this.loading) {
        if (message) {
          this.loading.message = message;
        }
        return;
      }

      // Criar novo loading
      console.log('🔄 Criando loading...');
      this.loading = await this.loadingController.create({
        message: message || 'Carregando...',
        duration: duration,
        spinner: 'crescent',
        cssClass: 'custom-loading',
        backdropDismiss: false,
      });

      await this.loading.present();
      this.loadingSubject.next(true);
      console.log('✅ Loading exibido');

      // 🔥 NOVO: Timer de segurança (10 segundos)
      this.resetAutoCleanupTimer();

    } catch (error) {
      console.error('❌ Erro ao exibir loading:', error);
      this.loading = null;
      this.loadingSubject.next(false);
    }
  }

  /**
   * Hide loading indicator
   * Only hides when all requests are complete
   */
  async hide(): Promise<void> {
    try {
      this.requestCount--;

      // 🔥 CORREÇÃO: Garantir que nunca fica negativo
      if (this.requestCount < 0) {
        console.warn('⚠️ RequestCount negativo! Resetando para 0');
        this.requestCount = 0;
      }

      console.log('📊 LoadingService.hide() - requestCount:', this.requestCount);

      // 🔥 NOVO: Se requestCount for 0, remove o loading
      if (this.requestCount === 0) {
        await this.dismissLoading();
      }

    } catch (error) {
      console.error('❌ Erro ao esconder loading:', error);
      // 🔥 Em caso de erro, força limpeza
      await this.forceCleanup();
    }
  }

  /**
   * Force hide loading indicator regardless of request count
   * Useful for error scenarios or manual control
   */
  async forceHide(): Promise<void> {
    console.log('🔥 ForceHide chamado');
    this.requestCount = 0;
    await this.dismissLoading();
  }

  /**
   * 🔥 NOVO: Método privado para remover loading com segurança
   */
  private async dismissLoading(): Promise<void> {
    try {
      if (this.loading) {
        console.log('🔄 Removendo loading...');
        await this.loading.dismiss();
        this.loading = null;
        this.loadingSubject.next(false);
        console.log('✅ Loading removido com sucesso');

        // Limpar timer de segurança
        this.clearAutoCleanupTimer();
      }
    } catch (error) {
      console.error('❌ Erro ao remover loading via dismiss():', error);
      // 🔥 Fallback: Forçar remoção via DOM
      await this.forceCleanup();
    }
  }

  /**
   * 🔥 NOVO: Limpeza forçada via DOM (último recurso)
   */
  private async forceCleanup(): Promise<void> {
    console.warn('⚠️ Executando limpeza forçada via DOM...');

    try {
      // Remover via dismiss() primeiro
      if (this.loading) {
        try {
          await this.loading.dismiss();
        } catch (e) {
          console.warn('Dismiss falhou, continuando com limpeza DOM');
        }
        this.loading = null;
      }

      // Remover todos os loadings/backdrops do DOM
      const stuckElements = document.querySelectorAll('ion-loading, ion-backdrop');

      if (stuckElements.length > 0) {
        console.log('🗑️ Removendo', stuckElements.length, 'elementos via DOM');
        stuckElements.forEach((el) => el.remove());
      }

      // Resetar estado
      this.requestCount = 0;
      this.loadingSubject.next(false);
      this.clearAutoCleanupTimer();

      console.log('✅ Limpeza forçada concluída');

    } catch (error) {
      console.error('❌ Erro crítico na limpeza forçada:', error);
    }
  }

  /**
   * 🔥 NOVO: Timer de segurança automático
   */
  private startAutoCleanup(): void {
    // Verificar a cada 30 segundos se há loadings travados
    setInterval(() => {
      const stuckElements = document.querySelectorAll('ion-loading, ion-backdrop');

      if (stuckElements.length > 0 && this.requestCount === 0) {
        console.warn('⚠️ Detectados loadings travados! Limpando automaticamente...');
        this.forceCleanup();
      }
    }, 30000); // 30 segundos
  }

  /**
   * 🔥 NOVO: Reset do timer de segurança (10 segundos após show)
   */
  private resetAutoCleanupTimer(): void {
    this.clearAutoCleanupTimer();

    // Se o loading não for removido em 10 segundos, limpa automaticamente
    this.autoCleanupTimeout = setTimeout(() => {
      console.warn('⚠️ Loading ativo por mais de 10 segundos! Forçando limpeza...');
      this.forceCleanup();
    }, 10000); // 10 segundos
  }

  /**
   * 🔥 NOVO: Limpar timer de segurança
   */
  private clearAutoCleanupTimer(): void {
    if (this.autoCleanupTimeout) {
      clearTimeout(this.autoCleanupTimeout);
      this.autoCleanupTimeout = null;
    }
  }

  /**
   * Check if loading is currently shown
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get the current request count
   */
  getRequestCount(): number {
    return this.requestCount;
  }
}
