import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, retryWhen, mergeMap, finalize } from 'rxjs/operators';

/**
 * Retry Interceptor
 *
 * Automatically retries failed HTTP requests with exponential backoff
 * Useful for handling temporary network issues
 *
 * Configuration via custom headers:
 * - X-Retry-Count: Number of retry attempts (default: 3)
 * - X-Retry-Delay: Initial delay in ms (default: 1000)
 * - X-Skip-Retry: Set to 'true' to skip retry logic
 */
@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_BACKOFF_DELAY = 1000; // 1 second
  private readonly RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Check if retry should be skipped
    if (req.headers.get('X-Skip-Retry') === 'true') {
      return next.handle(req);
    }

    const maxRetries = this.getMaxRetries(req);
    const backoffDelay = this.getBackoffDelay(req);

    return next.handle(req).pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;

            // Check if we should retry this error
            if (!this.shouldRetry(error, retryAttempt, maxRetries)) {
              return throwError(() => error);
            }

            // Calculate exponential backoff delay
            const delayTime = backoffDelay * Math.pow(2, index);

            console.log(
              `🔄 Retrying request (${retryAttempt}/${maxRetries}) after ${delayTime}ms:`,
              req.url,
            );

            return timer(delayTime);
          }),
          finalize(() => {
            console.log('✅ Retry sequence completed for:', req.url);
          }),
        ),
      ),
    );
  }

  /**
   * Determine if the request should be retried
   */
  private shouldRetry(
    error: any,
    retryAttempt: number,
    maxRetries: number,
  ): boolean {
    // Don't retry if max retries exceeded
    if (retryAttempt > maxRetries) {
      return false;
    }

    // Only retry for HTTP errors
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    // Don't retry client errors (except specific ones)
    if (error.status >= 400 && error.status < 500) {
      return this.RETRYABLE_STATUS_CODES.includes(error.status);
    }

    // Retry all server errors (5xx)
    return error.status >= 500;
  }

  /**
   * Get max retries from request headers or use default
   */
  private getMaxRetries(req: HttpRequest<any>): number {
    const header = req.headers.get('X-Retry-Count');
    return header ? parseInt(header, 10) : this.DEFAULT_MAX_RETRIES;
  }

  /**
   * Get backoff delay from request headers or use default
   */
  private getBackoffDelay(req: HttpRequest<any>): number {
    const header = req.headers.get('X-Retry-Delay');
    return header ? parseInt(header, 10) : this.DEFAULT_BACKOFF_DELAY;
  }
}
