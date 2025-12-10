import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../config.service';

/**
 * Auth Interceptor
 *
 * Automatically adds authentication token to outgoing requests
 * Adds common headers to all API requests
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if request is to our API
    const apiBaseUrl = this.configService.getApiBaseUrl();
    if (!req.url.startsWith(apiBaseUrl)) {
      return next.handle(req);
    }

    // Get auth token
    const token = this.getAuthToken();

    // Clone request and add headers
    let authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add authorization header if token exists
    if (token) {
      authReq = authReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq);
  }

  private getAuthToken(): string | null {
    try {
      const tokenKey = this.configService.getTokenKey();
      return localStorage.getItem(tokenKey);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
}
