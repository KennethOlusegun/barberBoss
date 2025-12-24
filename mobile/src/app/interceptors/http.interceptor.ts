import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class NgrokHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 🔥 CORRIGIDO: Inclui todos os domínios ngrok possíveis
    if (
      request.url.includes('ngrok-free.dev') ||  // 👈 SEU DOMÍNIO ATUAL
      request.url.includes('ngrok-free.app') ||
      request.url.includes('ngrok.io') ||
      request.url.includes('ngrok.app')
    ) {
      const cloned = request.clone({
        setHeaders: {
          'ngrok-skip-browser-warning': '69420',  // 👈 Valor recomendado
          'Content-Type': 'application/json',
        },
      });

      console.log('🔧 NgrokHttpInterceptor aplicado:', request.url);
      return next.handle(cloned);
    }

    return next.handle(request);
  }
}
