import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ConfigService } from '../config.service';
import { ApiErrorCode } from './api.types';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  const mockConfig = {
    getApiUrl: () => 'http://localhost:3000/api',
    getApiTimeout: () => 30000,
    getTokenKey: () => 'auth_token',
    isProduction: () => false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, { provide: ConfigService, useValue: mockConfig }],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET requests', () => {
    it('should perform a GET request', () => {
      const mockData = { id: 1, name: 'Test' };

      service.get('/users/1').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should include query parameters', () => {
      service.get('/users', { params: { page: 1, limit: 10 } }).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users?page=1&limit=10',
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('POST requests', () => {
    it('should perform a POST request', () => {
      const postData = { name: 'New User' };
      const mockResponse = { id: 1, ...postData };

      service.post('/users', postData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(postData);
      req.flush(mockResponse);
    });
  });

  describe('Authentication', () => {
    it('should include auth token in headers when requiresAuth is true', () => {
      localStorage.setItem('auth_token', 'test-token');

      service.get('/users', { requiresAuth: true }).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/users');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer test-token',
      );
      req.flush([]);
    });

    it('should not include auth token when requiresAuth is false', () => {
      localStorage.setItem('auth_token', 'test-token');

      service.get('/users', { requiresAuth: false }).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/users');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });
  });

  describe('Error handling', () => {
    it('should handle 404 errors', () => {
      service.get('/users/999').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.code).toBe(ApiErrorCode.NOT_FOUND);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/users/999');
      req.flush(
        { message: 'Not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });

    it('should handle network errors', () => {
      service.get('/users').subscribe({
        error: (error) => {
          expect(error.code).toBe(ApiErrorCode.NETWORK_ERROR);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/users');
      req.error(new ProgressEvent('error'));
    });
  });

  describe('Active requests tracking', () => {
    it('should track active requests', () => {
      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);

      service.get('/users').subscribe();

      // Request is active
      expect(service.getActiveRequestCount()).toBe(1);
      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne('http://localhost:3000/api/users');
      req.flush([]);

      // Request completed
      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('URL building', () => {
    it('should build URL with parameters', () => {
      const url = service.buildUrlWithParams('/users', {
        page: 1,
        limit: 10,
        search: 'test',
      });

      expect(url).toBe(
        'http://localhost:3000/api/users?page=1&limit=10&search=test',
      );
    });

    it('should handle null and undefined parameters', () => {
      const url = service.buildUrlWithParams('/users', {
        page: 1,
        name: null,
        email: undefined,
      });

      expect(url).toBe('http://localhost:3000/api/users?page=1');
    });
  });
});
