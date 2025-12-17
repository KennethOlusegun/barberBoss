import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { AUTH_CONFIG } from '../services/auth/auth.config';

/**
 * JWT Authentication Interceptor
 *
 * Automatically adds JWT token to outgoing HTTP requests
 * and handles token refresh on 401 errors.
 *
 * Features:
 * - Adds Authorization header to authenticated requests
 * - Handles token refresh on 401 Unauthorized errors
 * - Prevents multiple simultaneous refresh requests
 * - Queues requests while token is being refreshed
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Add token to request if available
    const token = this.authService.getToken();
    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401 && token) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      }),
    );
  }

  /**
   * Add JWT token to request headers
   * @param request HTTP request
   * @param token JWT token
   * @returns Modified request with Authorization header
   */
  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string,
  ): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        [AUTH_CONFIG.TOKEN_HEADER_KEY]: `${AUTH_CONFIG.TOKEN_PREFIX} ${token}`,
      },
    });
  }

  /**
   * Handle 401 Unauthorized error by refreshing token
   * @param request Original HTTP request
   * @param next HTTP handler
   * @returns Observable of HTTP event
   */
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addTokenToRequest(request, token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout().subscribe();
          return throwError(() => error);
        }),
      );
    } else {
      // Queue request while token is being refreshed
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) =>
          next.handle(this.addTokenToRequest(request, token!)),
        ),
      );
    }
  }
}
