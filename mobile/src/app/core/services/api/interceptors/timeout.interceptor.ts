import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

/**
 * Timeout Interceptor
 *
 * Automatically applies timeout to HTTP requests
 * Prevents requests from hanging indefinitely
 *
 * Configuration via custom headers:
 * - X-Timeout: Timeout in milliseconds
 * - X-Skip-Timeout: Set to 'true' to skip timeout logic
 */
@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Check if timeout should be skipped
    if (req.headers.get('X-Skip-Timeout') === 'true') {
      return next.handle(req);
    }

    const timeoutValue = this.getTimeout(req);

    return next.handle(req).pipe(
      timeout(timeoutValue),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          console.error(`⏱️ Request timeout after ${timeoutValue}ms:`, req.url);
          return throwError(
            () =>
              new HttpErrorResponse({
                error: 'Request timeout',
                status: 408,
                statusText: 'Request Timeout',
                url: req.url,
              }),
          );
        }
        return throwError(() => error);
      }),
    );
  }

  /**
   * Get timeout from request headers or use default
   */
  private getTimeout(req: HttpRequest<any>): number {
    const header = req.headers.get('X-Timeout');
    return header ? parseInt(header, 10) : this.DEFAULT_TIMEOUT;
  }
}
