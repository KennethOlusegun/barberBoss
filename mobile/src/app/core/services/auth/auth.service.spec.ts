import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../api/api.service';
import { ConfigService } from '../config.service';
import { UserRole, LoginCredentials, RegisterData, AuthResponse } from './auth.types';
import { AUTH_ENDPOINTS } from './auth.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    role: UserRole.CLIENT,
    createdAt: '2025-12-10T00:00:00.000Z',
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'mock-jwt-token',
    user: mockUser,
    refresh_token: 'mock-refresh-token',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService, ConfigService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with unauthenticated state', (done) => {
      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBeFalse();
        done();
      });
    });
  });

  describe('login', () => {
    it('should login successfully', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(credentials).subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(
        `${configService.getApiUrl()}${AUTH_ENDPOINTS.LOGIN}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('should store token after successful login', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(credentials).subscribe(() => {
        expect(service.getToken()).toBe(mockAuthResponse.access_token);
        done();
      });

      const req = httpMock.expectOne(
        `${configService.getApiUrl()}${AUTH_ENDPOINTS.LOGIN}`
      );
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register successfully', (done) => {
      const registerData: RegisterData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        role: UserRole.CLIENT,
      };

      service.register(registerData).subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(
        `${configService.getApiUrl()}${AUTH_ENDPOINTS.REGISTER}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should clear authentication state', (done) => {
      // First login
      service.login({ email: 'test@example.com', password: 'password' }).subscribe(() => {
        // Then logout
        service.logout().subscribe(() => {
          expect(service.isAuthenticated()).toBeFalse();
          expect(service.getToken()).toBeNull();
          done();
        });
      });

      const loginReq = httpMock.expectOne(
        `${configService.getApiUrl()}${AUTH_ENDPOINTS.LOGIN}`
      );
      loginReq.flush(mockAuthResponse);

      const logoutReq = httpMock.expectOne(
        `${configService.getApiUrl()}${AUTH_ENDPOINTS.LOGOUT}`
      );
      logoutReq.flush({});
    });
  });

  describe('role checks', () => {
    beforeEach((done) => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        `${configService.getApiUrl()}${AUTH_ENDPOINTS.LOGIN}`
      );
      req.flush(mockAuthResponse);
    });

    it('should check user role correctly', () => {
      expect(service.hasRole(UserRole.CLIENT)).toBeTrue();
      expect(service.hasRole(UserRole.ADMIN)).toBeFalse();
    });

    it('should check multiple roles correctly', () => {
      expect(service.hasAnyRole([UserRole.CLIENT, UserRole.BARBER])).toBeTrue();
      expect(service.hasAnyRole([UserRole.ADMIN, UserRole.BARBER])).toBeFalse();
    });

    it('should get user role', () => {
      expect(service.getUserRole()).toBe(UserRole.CLIENT);
    });
  });

  describe('token management', () => {
    it('should get stored token', () => {
      const token = 'test-token';
      localStorage.setItem('barber_boss_token', token);
      expect(service.getToken()).toBe(token);
    });

    it('should check if token is valid', () => {
      // Mock a valid token (expires in future)
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { sub: '123', email: 'test@test.com', role: UserRole.CLIENT, exp: futureTimestamp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      localStorage.setItem('barber_boss_token', token);
      expect(service.isAuthenticated()).toBeTrue();
    });
  });
});
