import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider, EnvironmentProviders } from '@angular/core';
import {
  AuthInterceptor,
  ErrorInterceptor,
  LoggingInterceptor,
  CachingInterceptor,
} from './interceptors';

/**
 * HTTP Interceptors Configuration
 *
 * Provides all HTTP interceptors for the application
 * Add this to your app.config.ts providers array
 *
 * @example
 * // In app.config.ts
 * import { provideApiHttpClient } from './core/services/api';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideApiHttpClient(),
 *     // ... other providers
 *   ]
 * };
 */
export function provideApiHttpClient(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CachingInterceptor,
      multi: true,
    },
  ];
}
