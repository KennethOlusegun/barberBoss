import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider, EnvironmentProviders } from '@angular/core';
import {
  AuthInterceptor,
  ErrorInterceptor,
  LoggingInterceptor,
  CachingInterceptor,
  RetryInterceptor,
  LoadingInterceptor,
  TimeoutInterceptor,
} from './interceptors';

/**
 * HTTP Interceptors Configuration
 *
 * Provides all HTTP interceptors for the application
 * Add this to your app.config.ts providers array
 *
 * Interceptors are executed in the following order:
 * 1. TimeoutInterceptor - Applies timeout to requests
 * 2. LoadingInterceptor - Shows/hides loading indicator
 * 3. AuthInterceptor - Adds authentication token
 * 4. LoggingInterceptor - Logs requests/responses (dev only)
 * 5. RetryInterceptor - Retries failed requests
 * 6. CachingInterceptor - Caches GET requests
 * 7. ErrorInterceptor - Handles errors globally
 *
 * @example
 * // In main.ts
 * import { provideApiHttpClient } from './core/services/api';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideApiHttpClient(),
 *     // ... other providers
 *   ]
 * });
 */
export function provideApiHttpClient(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    // Timeout should be first to apply to all requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutInterceptor,
      multi: true,
    },
    // Loading should be early to show immediately
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    // Auth should be before most interceptors to add token
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // Logging for debugging
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true,
    },
    // Retry failed requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RetryInterceptor,
      multi: true,
    },
    // Caching for performance
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CachingInterceptor,
      multi: true,
    },
    // Error handling should be last to catch all errors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ];
}
