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
    // 🔥 CORRIGIDO: Inclui todos os domínios ngrok possíveis
    if (
      req.url.includes('ngrok-free.dev') ||  // 👈 SEU DOMÍNIO ATUAL
      req.url.includes('ngrok-free.app') ||
      req.url.includes('ngrok.io') ||
      req.url.includes('ngrok.app')
    ) {
      const cloned = req.clone({
        setHeaders: {
          'ngrok-skip-browser-warning': '69420',  // 👈 Valor recomendado pela doc do ngrok
          'Content-Type': 'application/json',
        }
      });

      console.log('🔧 NgrokInterceptor aplicado:', req.url);
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
