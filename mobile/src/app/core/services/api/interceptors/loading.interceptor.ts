import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../../../services/loading.service';

/**
 * Loading Interceptor
 *
 * Shows/hides loading indicator for HTTP requests
 * Automatically manages loading state during API calls
 *
 * Configuration via custom headers:
 * - X-Skip-Loading: Set to 'true' to skip showing loading indicator
 * - X-Loading-Message: Custom loading message to display
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Check if loading should be skipped for this request
    if (req.headers.get('X-Skip-Loading') === 'true') {
      return next.handle(req);
    }

    // Get custom loading message if provided
    const loadingMessage = req.headers.get('X-Loading-Message') || undefined;

    // Increment active requests counter
    this.activeRequests++;

    // Show loading indicator
    if (this.activeRequests === 1) {
      this.loadingService.show(loadingMessage);
    }

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            // Request completed successfully
            this.decrementRequests();
          }
        },
        error: (error: HttpErrorResponse) => {
          // Request failed
          this.decrementRequests();
        },
      }),
      finalize(() => {
        // Ensure loading is hidden even if tap doesn't catch it
        this.decrementRequests();
      }),
    );
  }

  /**
   * Decrement active requests and hide loading if no more active requests
   */
  private decrementRequests(): void {
    this.activeRequests--;

    // Ensure counter doesn't go negative
    if (this.activeRequests < 0) {
      this.activeRequests = 0;
    }

    // Hide loading when all requests are complete
    if (this.activeRequests === 0) {
      this.loadingService.hide();
    }
  }
}
