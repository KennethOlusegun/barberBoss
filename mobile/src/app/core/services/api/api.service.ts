import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout, map, retryWhen, mergeMap, finalize } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import {
  ApiRequestOptions,
  ApiResponse,
  ApiError,
  HttpMethod,
  ApiErrorCode,
  PaginatedResponse,
} from './api.types';
import { API_CONFIG, HTTP_HEADERS, CONTENT_TYPES } from './api.config';

/**
 * Base API Service
 *
 * Provides a centralized HTTP client with advanced features:
 * - Automatic request/response intercepting
 * - Error handling and retry logic
 * - Authentication token injection
 * - Request timeout management
 * - Response transformation
 * - Loading state management
 *
 * @example
 * // Simple GET request
 * this.apiService.get<User>('/users/123').subscribe(user => {
 *   console.log(user);
 * });
 *
 * // POST request with options
 * this.apiService.post<User>('/users', userData, {
 *   requiresAuth: true,
 *   retry: true
 * }).subscribe(newUser => {
 *   console.log(newUser);
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;
  private activeRequests = 0;
  private loadingState$ = new Observable<boolean>();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getApiUrl();
    this.defaultTimeout = this.configService.getApiTimeout();
  }

  /**
   * Get the number of active HTTP requests
   */
  getActiveRequestCount(): number {
    return this.activeRequests;
  }

  /**
   * Check if there are any active requests
   */
  isLoading(): boolean {
    return this.activeRequests > 0;
  }

  // ==================== HTTP Methods ====================

  /**
   * Perform a GET request
   * @param endpoint API endpoint (relative to base URL)
   * @param options Request options
   */
  get<T = any>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>(HttpMethod.GET, endpoint, undefined, options);
  }

  /**
   * Perform a POST request
   * @param endpoint API endpoint (relative to base URL)
   * @param body Request body
   * @param options Request options
   */
  post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>(HttpMethod.POST, endpoint, body, options);
  }

  /**
   * Perform a PUT request
   * @param endpoint API endpoint (relative to base URL)
   * @param body Request body
   * @param options Request options
   */
  put<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>(HttpMethod.PUT, endpoint, body, options);
  }

  /**
   * Perform a PATCH request
   * @param endpoint API endpoint (relative to base URL)
   * @param body Request body
   * @param options Request options
   */
  patch<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>(HttpMethod.PATCH, endpoint, body, options);
  }

  /**
   * Perform a DELETE request
   * @param endpoint API endpoint (relative to base URL)
   * @param options Request options
   */
  delete<T = any>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>(HttpMethod.DELETE, endpoint, undefined, options);
  }

  // ==================== Core Request Handler ====================

  /**
   * Core request handler that all HTTP methods use
   * @private
   */
  private request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options);
    const params = this.buildParams(options.params);
    const requestTimeout = options.timeout || this.defaultTimeout;

    // Increment active requests counter
    this.activeRequests++;

    // Build HTTP options
    const httpOptions: any = {
      headers,
      params,
      responseType: options.responseType || 'json',
      reportProgress: options.reportProgress || false,
    };

    // Make the HTTP request
    let request$: Observable<any>;

    switch (method) {
      case HttpMethod.GET:
        request$ = this.http.get(url, httpOptions);
        break;
      case HttpMethod.POST:
        request$ = this.http.post(url, body, httpOptions);
        break;
      case HttpMethod.PUT:
        request$ = this.http.put(url, body, httpOptions);
        break;
      case HttpMethod.PATCH:
        request$ = this.http.patch(url, body, httpOptions);
        break;
      case HttpMethod.DELETE:
        request$ = this.http.delete(url, httpOptions);
        break;
      default:
        return throwError(() => this.createError('Invalid HTTP method', 400, ApiErrorCode.BAD_REQUEST));
    }

    // Apply operators
    return request$.pipe(
      timeout(requestTimeout),
      this.applyRetryLogic(options, method),
      map((response: any) => this.extractData<T>(response)),
      catchError((error: any) => this.handleError(error, options)),
      finalize(() => {
        this.activeRequests--;
      })
    ) as Observable<T>;
  }

  // ==================== Helper Methods ====================

  /**
   * Build the full URL
   * @private
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Build HTTP headers
   * @private
   */
  private buildHeaders(options: ApiRequestOptions): HttpHeaders {
    let headers = new HttpHeaders({
      [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      [HTTP_HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
    });

    // Add custom headers
    if (options.headers) {
      Object.keys(options.headers).forEach((key) => {
        headers = headers.set(key, options.headers![key]);
      });
    }

    // Add authentication token if required
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers = headers.set(HTTP_HEADERS.AUTHORIZATION, `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Build HTTP params
   * @private
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              httpParams = httpParams.append(key, String(item));
            });
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }

    return httpParams;
  }

  /**
   * Extract data from response
   * @private
   */
  private extractData<T>(response: any): T {
    // If response has a data property, extract it
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    // Otherwise return the response as-is
    return response;
  }

  /**
   * Apply retry logic based on options
   * @private
   */
  private applyRetryLogic(options: ApiRequestOptions, method: HttpMethod): any {
    if (options.retry === false) {
      return (source: Observable<any>) => source;
    }

    const retryAttempts = options.retryAttempts || API_CONFIG.DEFAULT_RETRY_ATTEMPTS;
    const retryDelay = options.retryDelay || API_CONFIG.DEFAULT_RETRY_DELAY;

    // Only retry safe HTTP methods
    if (!API_CONFIG.RETRYABLE_METHODS.includes(method)) {
      return (source: Observable<any>) => source;
    }

    return retryWhen((errors: Observable<any>) =>
      errors.pipe(
        mergeMap((error, index) => {
          const attempt = index + 1;

          // Check if we should retry
          if (
            attempt <= retryAttempts &&
            this.isRetryableError(error)
          ) {
            console.log(`Retrying request (attempt ${attempt}/${retryAttempts})...`);
            return timer(retryDelay * attempt);
          }

          // Max retries exceeded or non-retryable error
          return throwError(() => error);
        })
      )
    );
  }

  /**
   * Check if an error is retryable
   * @private
   */
  private isRetryableError(error: HttpErrorResponse): boolean {
    return (
      !error.status || // Network error
      API_CONFIG.RETRYABLE_STATUS_CODES.includes(error.status)
    );
  }

  /**
   * Handle HTTP errors
   * @private
   */
  private handleError(error: any, options: ApiRequestOptions): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      apiError = this.createError(
        error.error.message,
        0,
        ApiErrorCode.NETWORK_ERROR,
        error
      );
    } else if (error.name === 'TimeoutError' || error.message?.includes('Timeout')) {
      // Timeout error
      apiError = this.createError(
        'Request timeout',
        0,
        ApiErrorCode.TIMEOUT,
        error
      );
    } else {
      // Backend error
      const message = error.error?.message || error.message || 'An error occurred';
      const code = this.getErrorCodeFromStatus(error.status);

      apiError = this.createError(
        message,
        error.status,
        code,
        error,
        error.error?.details
      );
    }

    // Call custom error handler if provided
    if (options.errorHandler) {
      options.errorHandler(apiError);
    }

    // Log error in debug mode
    if (!this.configService.isProduction()) {
      console.error('API Error:', apiError);
    }

    return throwError(() => apiError) as Observable<never>;
  }

  /**
   * Create an ApiError object
   * @private
   */
  private createError(
    message: string,
    status: number,
    code: ApiErrorCode,
    originalError?: any,
    details?: any
  ): ApiError {
    return {
      message,
      status,
      code,
      details,
      originalError,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get error code from HTTP status
   * @private
   */
  private getErrorCodeFromStatus(status: number): ApiErrorCode {
    switch (status) {
      case 400:
        return ApiErrorCode.BAD_REQUEST;
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
      case 403:
        return ApiErrorCode.FORBIDDEN;
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 422:
        return ApiErrorCode.VALIDATION_ERROR;
      case 500:
        return ApiErrorCode.SERVER_ERROR;
      case 503:
        return ApiErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ApiErrorCode.UNKNOWN_ERROR;
    }
  }

  /**
   * Get authentication token from storage
   * @private
   */
  private getAuthToken(): string | null {
    try {
      const tokenKey = this.configService.getTokenKey();
      return localStorage.getItem(tokenKey);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Build a URL with query parameters
   * @param endpoint Base endpoint
   * @param params Query parameters
   */
  buildUrlWithParams(endpoint: string, params: Record<string, any>): string {
    const url = this.buildUrl(endpoint);
    const queryString = Object.keys(params)
      .filter((key) => params[key] !== null && params[key] !== undefined)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Upload a file
   * @param endpoint API endpoint
   * @param file File to upload
   * @param fieldName Form field name
   * @param additionalData Additional form data
   */
  uploadFile<T = any>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.post<T>(endpoint, formData, {
      reportProgress: true,
    });
  }

  /**
   * Download a file
   * @param endpoint API endpoint
   * @param filename Filename for downloaded file
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    return this.get<Blob>(endpoint, {
      responseType: 'blob',
    }).pipe(
      map((blob: Blob) => {
        if (filename) {
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);
        }
        return blob;
      })
    );
  }
}
