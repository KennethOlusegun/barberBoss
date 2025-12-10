import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfigService } from '../../config.service';

/**
 * Logging Interceptor
 *
 * Logs all HTTP requests and responses in development mode
 * Useful for debugging API calls
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only log in development mode
    if (this.configService.isProduction()) {
      return next.handle(req);
    }

    const startTime = Date.now();

    console.log('🚀 HTTP Request:', {
      method: req.method,
      url: req.url,
      headers: this.getHeadersAsObject(req.headers),
      body: req.body,
    });

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log('✅ HTTP Response:', {
            method: req.method,
            url: req.url,
            status: event.status,
            duration: `${duration}ms`,
            body: event.body,
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        console.error('❌ HTTP Error:', {
          method: req.method,
          url: req.url,
          status: error.status,
          duration: `${duration}ms`,
          error: error.error,
        });
        return throwError(() => error);
      })
    );
  }

  private getHeadersAsObject(headers: any): Record<string, string> {
    const headersObj: Record<string, string> = {};
    headers.keys().forEach((key: string) => {
      headersObj[key] = headers.get(key);
    });
    return headersObj;
  }
}
