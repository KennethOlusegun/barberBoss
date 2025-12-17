import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TimeoutInterceptor } from './timeout.interceptor';
import { LoadingInterceptor } from './loading.interceptor';
import { RetryInterceptor } from './retry.interceptor';
import { CachingInterceptor } from './caching.interceptor';
import { LoadingService } from '../../../services/loading.service';

/**
 * Test suite for HTTP Interceptors
 *
 * Run with: ng test
 */

// ============================================
// 1. Timeout Interceptor Tests
// ============================================
describe('TimeoutInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TimeoutInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should apply default timeout', (done) => {
    httpClient.get('/api/test').subscribe({
      next: () => done(),
      error: () => done.fail('Should not timeout with quick response'),
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should apply custom timeout from header', (done) => {
    httpClient
      .get('/api/test', {
        headers: { 'X-Timeout': '5000' },
      })
      .subscribe({
        next: () => done(),
      });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should skip timeout when header is set', (done) => {
    httpClient
      .get('/api/test', {
        headers: { 'X-Skip-Timeout': 'true' },
      })
      .subscribe({
        next: () => done(),
      });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });
});

// ============================================
// 2. Loading Interceptor Tests
// ============================================
describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptor,
          multi: true,
        },
        { provide: LoadingService, useValue: loadingSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(
      LoadingService,
    ) as jasmine.SpyObj<LoadingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show loading on request start', () => {
    httpClient.get('/api/test').subscribe();

    expect(loadingService.show).toHaveBeenCalled();

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should hide loading on request complete', (done) => {
    httpClient.get('/api/test').subscribe(() => {
      setTimeout(() => {
        expect(loadingService.hide).toHaveBeenCalled();
        done();
      }, 100);
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should skip loading when header is set', () => {
    httpClient
      .get('/api/test', {
        headers: { 'X-Skip-Loading': 'true' },
      })
      .subscribe();

    expect(loadingService.show).not.toHaveBeenCalled();

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should show custom loading message', () => {
    const customMessage = 'Carregando dados...';

    httpClient
      .get('/api/test', {
        headers: { 'X-Loading-Message': customMessage },
      })
      .subscribe();

    expect(loadingService.show).toHaveBeenCalledWith(customMessage);

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });
});

// ============================================
// 3. Retry Interceptor Tests
// ============================================
describe('RetryInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: RetryInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retry on 500 error', (done) => {
    let attemptCount = 0;

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(attemptCount).toBeGreaterThan(1);
        done();
      },
    });

    // Simulate multiple 500 errors
    for (let i = 0; i < 4; i++) {
      const req = httpMock.expectOne('/api/test');
      attemptCount++;
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  });

  it('should not retry on 400 error', (done) => {
    let attemptCount = 0;

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(attemptCount).toBe(1);
        done();
      },
    });

    const req = httpMock.expectOne('/api/test');
    attemptCount++;
    req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
  });

  it('should skip retry when header is set', (done) => {
    let attemptCount = 0;

    httpClient
      .get('/api/test', {
        headers: { 'X-Skip-Retry': 'true' },
      })
      .subscribe({
        error: () => {
          expect(attemptCount).toBe(1);
          done();
        },
      });

    const req = httpMock.expectOne('/api/test');
    attemptCount++;
    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});

// ============================================
// 4. Caching Interceptor Tests
// ============================================
describe('CachingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let cachingInterceptor: CachingInterceptor;

  beforeEach(() => {
    cachingInterceptor = new CachingInterceptor();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useValue: cachingInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    cachingInterceptor.clearCache();
  });

  it('should cache GET requests', (done) => {
    // First request
    httpClient.get('/api/test').subscribe(() => {
      // Second request (should be cached)
      httpClient.get('/api/test').subscribe(() => {
        done();
      });
    });

    // Only one HTTP call should be made
    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should not cache POST requests', () => {
    httpClient.post('/api/test', { data: 'test' }).subscribe();
    const req1 = httpMock.expectOne('/api/test');
    req1.flush({ success: true });

    httpClient.post('/api/test', { data: 'test' }).subscribe();
    const req2 = httpMock.expectOne('/api/test');
    req2.flush({ success: true });
  });

  it('should skip cache when header is set', () => {
    httpClient
      .get('/api/test', {
        headers: { 'X-Cache-Duration': 'none' },
      })
      .subscribe();
    const req1 = httpMock.expectOne('/api/test');
    req1.flush({ data: 'test' });

    httpClient
      .get('/api/test', {
        headers: { 'X-Cache-Duration': 'none' },
      })
      .subscribe();
    const req2 = httpMock.expectOne('/api/test');
    req2.flush({ data: 'test' });
  });

  it('should clear cache for specific URL', (done) => {
    httpClient.get('/api/test').subscribe(() => {
      cachingInterceptor.clearCacheForUrl('/api/test');

      httpClient.get('/api/test').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ data: 'test' });
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });
});

// ============================================
// 5. Integration Tests
// ============================================
describe('Interceptors Integration', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TimeoutInterceptor,
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: RetryInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should apply multiple interceptors', (done) => {
    httpClient
      .get('/api/test', {
        headers: {
          'X-Timeout': '5000',
          'X-Retry-Count': '2',
        },
      })
      .subscribe({
        next: () => done(),
      });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('should handle errors across interceptors', (done) => {
    httpClient
      .get('/api/test', {
        headers: {
          'X-Skip-Retry': 'true',
        },
      })
      .subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

    const req = httpMock.expectOne('/api/test');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
