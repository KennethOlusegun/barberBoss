import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfigService } from '../../config.service';

/**
 * Error Interceptor
 *
 * Handles global HTTP errors
 * - Redirects to login on 401 (Unauthorized)
 * - Shows user-friendly error messages
 * - Logs errors in development mode
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private configService: ConfigService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          this.handleClientError(error);
        } else {
          // Server-side error
          this.handleServerError(error);
        }

        return throwError(() => error);
      }),
    );
  }

  private handleClientError(error: HttpErrorResponse): void {
    console.error('Client-side error:', error.error.message);
  }

  private handleServerError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        this.handle401Error();
        break;
      case 403:
        this.handle403Error();
        break;
      case 404:
        this.handle404Error(error);
        break;
      case 500:
        this.handle500Error();
        break;
      default:
        this.handleGenericError(error);
    }
  }

  private handle401Error(): void {
    console.log('Unauthorized - redirecting to login');
    // Clear auth token
    const tokenKey = this.configService.getTokenKey();
    localStorage.removeItem(tokenKey);
    // Redirect to login
    this.router.navigate(['/login']);
  }

  private handle403Error(): void {
    console.error('Forbidden - insufficient permissions');
  }

  private handle404Error(error: HttpErrorResponse): void {
    console.error('Not found:', error.url);
  }

  private handle500Error(): void {
    console.error('Server error - please try again later');
  }

  private handleGenericError(error: HttpErrorResponse): void {
    console.error('HTTP error:', error.status, error.message);
  }
}
