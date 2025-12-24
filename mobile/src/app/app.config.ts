import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';

// 🔥 Importe seus interceptors (ajuste o caminho conforme sua estrutura)
import { NgrokInterceptor } from './interceptors/ngrok.interceptor';
import { NgrokHttpInterceptor } from './interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular({}),

    // 🔥 Registre AMBOS os interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgrokInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgrokHttpInterceptor,
      multi: true,
    },
  ],
};
