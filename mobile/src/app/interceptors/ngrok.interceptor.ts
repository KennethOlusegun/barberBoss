import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor para adicionar headers ngrok automaticamente em requests para domínios ngrok.
 */
@Injectable()
export class NgrokInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('ngrok-free.app') || req.url.includes('ngrok.io')) {
      const cloned = req.clone({
        setHeaders: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
