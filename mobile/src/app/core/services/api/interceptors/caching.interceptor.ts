import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheEntry {
  url: string;
  response: HttpResponse<any>;
  timestamp: number;
}

/**
 * Caching Interceptor
 *
 * Caches GET requests for improved performance
 * Configurable cache duration per request
 */
@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Check if request should be cached (via custom header)
    const cacheDuration = this.getCacheDuration(req);
    if (cacheDuration === 0) {
      return next.handle(req);
    }

    // Check cache
    const cachedResponse = this.getFromCache(req.url);
    if (cachedResponse) {
      console.log('📦 Serving from cache:', req.url);
      return of(cachedResponse);
    }

    // Make request and cache response
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.addToCache(req.url, event, cacheDuration);
        }
      }),
    );
  }

  private getCacheDuration(req: HttpRequest<any>): number {
    const header = req.headers.get('X-Cache-Duration');
    if (header === 'none') {
      return 0;
    }
    return header ? parseInt(header, 10) : this.DEFAULT_CACHE_DURATION;
  }

  private getFromCache(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);
    if (!entry) {
      return null;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (now - entry.timestamp > this.DEFAULT_CACHE_DURATION) {
      this.cache.delete(url);
      return null;
    }

    return entry.response;
  }

  private addToCache(
    url: string,
    response: HttpResponse<any>,
    duration: number,
  ): void {
    const entry: CacheEntry = {
      url,
      response,
      timestamp: Date.now(),
    };
    this.cache.set(url, entry);

    // Auto-clear after duration
    setTimeout(() => {
      this.cache.delete(url);
    }, duration);
  }

  /**
   * Clear all cached entries
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific URL from cache
   */
  clearCacheForUrl(url: string): void {
    this.cache.delete(url);
  }
}
