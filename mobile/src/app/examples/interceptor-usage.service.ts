import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Example Service demonstrating HTTP Interceptor usage
 *
 * Shows different configurations and use cases for the interceptors
 */
@Injectable({
  providedIn: 'root',
})
export class ExampleInterceptorUsageService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // ============================================
  // 1. BASIC REQUEST - All interceptors applied
  // ============================================

  /**
   * Standard GET request
   * - Timeout: 30s
   * - Loading: Shown
   * - Auth: Token added
   * - Logging: Enabled (dev)
   * - Retry: 3 attempts
   * - Cache: 5 minutes
   * - Error handling: Enabled
   */
  basicGet(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  /**
   * Standard POST request
   * - Timeout: 30s
   * - Loading: Shown
   * - Auth: Token added
   * - Logging: Enabled (dev)
   * - Retry: 3 attempts
   * - Cache: Not applied (POST)
   * - Error handling: Enabled
   */
  basicPost(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  // ============================================
  // 2. TIMEOUT CUSTOMIZATION
  // ============================================

  /**
   * Long operation with extended timeout (2 minutes)
   */
  longOperation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/long-operation`, {
      headers: {
        'X-Timeout': '120000', // 2 minutes
      },
    });
  }

  /**
   * Critical operation without timeout
   */
  criticalOperation(): Observable<any> {
    return this.http.post(`${this.apiUrl}/critical`, null, {
      headers: {
        'X-Skip-Timeout': 'true',
      },
    });
  }

  // ============================================
  // 3. LOADING CUSTOMIZATION
  // ============================================

  /**
   * Background sync without loading indicator
   */
  backgroundSync(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, null, {
      headers: {
        'X-Skip-Loading': 'true',
      },
    });
  }

  /**
   * File upload with custom loading message
   */
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: {
        'X-Loading-Message': 'Fazendo upload do arquivo...',
        'X-Timeout': '60000', // 1 minute for upload
      },
    });
  }

  /**
   * Image processing with custom message
   */
  processImage(imageId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-image/${imageId}`, null, {
      headers: {
        'X-Loading-Message': 'Processando imagem...',
      },
    });
  }

  // ============================================
  // 4. RETRY CUSTOMIZATION
  // ============================================

  /**
   * Unstable endpoint with more retry attempts
   */
  unstableEndpoint(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unstable`, {
      headers: {
        'X-Retry-Count': '5', // 5 retries instead of 3
        'X-Retry-Delay': '2000', // Start with 2s delay
      },
    });
  }

  /**
   * Payment operation without retry (critical)
   */
  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment`, paymentData, {
      headers: {
        'X-Skip-Retry': 'true', // No retry for payments
        'X-Loading-Message': 'Processando pagamento...',
      },
    });
  }

  // ============================================
  // 5. CACHE CUSTOMIZATION
  // ============================================

  /**
   * Static configuration with long cache (1 hour)
   */
  getStaticConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/config`, {
      headers: {
        'X-Cache-Duration': '3600000', // 1 hour
        'X-Skip-Loading': 'true', // No loading for cached data
      },
    });
  }

  /**
   * Real-time data without cache
   */
  getRealTimeData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/real-time`, {
      headers: {
        'X-Cache-Duration': 'none', // No cache
      },
    });
  }

  /**
   * User preferences with medium cache (10 minutes)
   */
  getUserPreferences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/preferences`, {
      headers: {
        'X-Cache-Duration': '600000', // 10 minutes
      },
    });
  }

  // ============================================
  // 6. COMBINED CONFIGURATIONS
  // ============================================

  /**
   * Background data sync
   * - No loading indicator
   * - More retry attempts
   * - Extended timeout
   */
  comprehensiveSync(): Observable<any> {
    return this.http.post(`${this.apiUrl}/comprehensive-sync`, null, {
      headers: {
        'X-Skip-Loading': 'true',
        'X-Retry-Count': '5',
        'X-Retry-Delay': '2000',
        'X-Timeout': '120000',
      },
    });
  }

  /**
   * Fast, cached, background request
   * - No loading
   * - Cached for 30 minutes
   * - Short timeout
   */
  quickBackgroundFetch(): Observable<any> {
    return this.http.get(`${this.apiUrl}/quick-data`, {
      headers: {
        'X-Skip-Loading': 'true',
        'X-Cache-Duration': '1800000', // 30 minutes
        'X-Timeout': '5000', // 5 seconds
      },
    });
  }

  /**
   * Critical operation requiring all safety measures
   * - Custom loading message
   * - No retry
   * - Extended timeout
   */
  criticalMutation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/critical-mutation`, data, {
      headers: {
        'X-Loading-Message': 'Executando operação crítica...',
        'X-Skip-Retry': 'true',
        'X-Timeout': '60000',
      },
    });
  }

  // ============================================
  // 7. SPECIAL USE CASES
  // ============================================

  /**
   * Polling endpoint
   * - No loading (happens in background)
   * - Short timeout
   * - No cache
   * - Retry on failure
   */
  pollStatus(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${id}`, {
      headers: {
        'X-Skip-Loading': 'true',
        'X-Cache-Duration': 'none',
        'X-Timeout': '10000',
        'X-Retry-Count': '3',
      },
    });
  }

  /**
   * Batch operation
   * - Custom loading message
   * - Extended timeout
   * - No retry (batch should be atomic)
   */
  batchUpdate(items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/batch`, { items }, {
      headers: {
        'X-Loading-Message': `Atualizando ${items.length} itens...`,
        'X-Timeout': '180000', // 3 minutes
        'X-Skip-Retry': 'true',
      },
    });
  }

  /**
   * Download file
   * - Custom loading message
   * - Extended timeout
   * - No cache
   */
  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileId}`, {
      responseType: 'blob',
      headers: {
        'X-Loading-Message': 'Baixando arquivo...',
        'X-Timeout': '300000', // 5 minutes
        'X-Cache-Duration': 'none',
      },
    });
  }

  /**
   * Search with debounce
   * - No loading (for better UX)
   * - Short cache (1 minute)
   * - Short timeout
   */
  search(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, {
      params: { q: query },
      headers: {
        'X-Skip-Loading': 'true',
        'X-Cache-Duration': '60000', // 1 minute
        'X-Timeout': '5000',
      },
    });
  }

  // ============================================
  // 8. EXAMPLE PATTERNS
  // ============================================

  /**
   * PATTERN: List/Detail
   * List is cached, detail is not
   */
  getList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, {
      headers: {
        'X-Cache-Duration': '300000', // 5 minutes cache
      },
    });
  }

  getDetail(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/${id}`, {
      headers: {
        'X-Cache-Duration': 'none', // Always fresh
      },
    });
  }

  /**
   * PATTERN: Read/Write
   * Reads are cached, writes are not
   */
  read(): Observable<any> {
    return this.http.get(`${this.apiUrl}/data`, {
      headers: {
        'X-Cache-Duration': '600000', // 10 minutes
      },
    });
  }

  write(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/data`, data, {
      headers: {
        'X-Skip-Retry': 'true', // Don't retry writes
      },
    });
  }

  /**
   * PATTERN: Silent/Loud
   * Silent operations don't show loading
   */
  silentUpdate(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/preferences`, data, {
      headers: {
        'X-Skip-Loading': 'true',
        'X-Retry-Count': '5',
      },
    });
  }

  loudUpdate(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, {
      headers: {
        'X-Loading-Message': 'Salvando perfil...',
      },
    });
  }
}
