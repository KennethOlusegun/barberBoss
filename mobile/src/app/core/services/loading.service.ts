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

  /**
   * Observable that emits the current loading state
   */
  public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private loadingController: LoadingController) {}

  /**
   * Show loading indicator
   * @param message Optional loading message
   * @param duration Optional duration in milliseconds (0 = indefinite)
   */
  async show(message?: string, duration: number = 0): Promise<void> {
    this.requestCount++;

    // If loading is already shown, just update the message
    if (this.loading) {
      if (message) {
        this.loading.message = message;
      }
      return;
    }

    // Create and show new loading indicator
    this.loading = await this.loadingController.create({
      message: message || 'Carregando...',
      duration: duration,
      spinner: 'crescent',
      cssClass: 'custom-loading',
      backdropDismiss: false,
    });

    await this.loading.present();
    this.loadingSubject.next(true);
  }

  /**
   * Hide loading indicator
   * Only hides when all requests are complete
   */
  async hide(): Promise<void> {
    this.requestCount--;

    // Don't hide if there are still pending requests
    if (this.requestCount > 0) {
      return;
    }

    // Ensure count doesn't go negative
    if (this.requestCount < 0) {
      this.requestCount = 0;
    }

    // Hide loading if it exists
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
      this.loadingSubject.next(false);
    }
  }

  /**
   * Force hide loading indicator regardless of request count
   * Useful for error scenarios or manual control
   */
  async forceHide(): Promise<void> {
    this.requestCount = 0;

    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
      this.loadingSubject.next(false);
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
