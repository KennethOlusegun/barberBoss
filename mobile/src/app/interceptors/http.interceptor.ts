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
    if (request.url.includes('ngrok')) {
      const cloned = request.clone({
        setHeaders: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}
