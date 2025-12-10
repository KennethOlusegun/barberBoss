# Environment Configuration - Testing Examples

Exemplos de testes para código que utiliza ConfigService.

## 📋 Índice

1. [Configuração Básica](#configuração-básica)
2. [Mocking ConfigService](#mocking-configservice)
3. [Testes de Componentes](#testes-de-componentes)
4. [Testes de Serviços](#testes-de-serviços)
5. [Testes de Guards](#testes-de-guards)
6. [Testes de Interceptors](#testes-de-interceptors)
7. [Testes de Feature Flags](#testes-de-feature-flags)
8. [Testes de Ambientes](#testes-de-ambientes)

## Configuração Básica

### Setup do TestBed

```typescript
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './core/services';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let configService: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    // Create spy object
    const spy = jasmine.createSpyObj('ConfigService', [
      'getApiUrl',
      'isDebugModeEnabled',
      'getStorageKey',
      'buildEndpointUrl',
      'isProduction'
    ]);

    TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [
        { provide: ConfigService, useValue: spy }
      ]
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Mocking ConfigService

### Mock Completo

```typescript
class MockConfigService {
  getApiUrl = jasmine.createSpy('getApiUrl').and.returnValue('http://test.com/api/v1');
  getApiBaseUrl = jasmine.createSpy('getApiBaseUrl').and.returnValue('http://test.com');
  getApiTimeout = jasmine.createSpy('getApiTimeout').and.returnValue(30000);
  buildEndpointUrl = jasmine.createSpy('buildEndpointUrl').and.callFake(
    (path: string) => `http://test.com/api/v1${path}`
  );
  
  getTokenKey = jasmine.createSpy('getTokenKey').and.returnValue('test_token');
  getStorageKey = jasmine.createSpy('getStorageKey').and.callFake(
    (key: string) => `test_${key}`
  );
  
  isDebugModeEnabled = jasmine.createSpy('isDebugModeEnabled').and.returnValue(false);
  isAnalyticsEnabled = jasmine.createSpy('isAnalyticsEnabled').and.returnValue(false);
  isProduction = jasmine.createSpy('isProduction').and.returnValue(false);
  
  getDefaultAppointmentDuration = jasmine.createSpy('getDefaultAppointmentDuration').and.returnValue(60);
  getMinAdvanceBooking = jasmine.createSpy('getMinAdvanceBooking').and.returnValue(1);
  
  getItemsPerPage = jasmine.createSpy('getItemsPerPage').and.returnValue(10);
  
  get = jasmine.createSpy('get').and.callFake((path: string) => {
    if (path === 'api.baseUrl') return 'http://test.com';
    return undefined;
  });
}

// Usage
providers: [
  { provide: ConfigService, useClass: MockConfigService }
]
```

### Mock com Valores Customizados

```typescript
function createMockConfig(overrides?: Partial<ConfigService>): jasmine.SpyObj<ConfigService> {
  const defaultMock = {
    getApiUrl: () => 'http://test.com/api/v1',
    isDebugModeEnabled: () => false,
    isProduction: () => false,
    getStorageKey: (key: string) => `test_${key}`,
    buildEndpointUrl: (path: string) => `http://test.com/api/v1${path}`,
  };

  const merged = { ...defaultMock, ...overrides };
  
  return jasmine.createSpyObj('ConfigService', 
    Object.keys(merged),
    merged
  );
}

// Usage
const mockConfig = createMockConfig({
  isDebugModeEnabled: () => true,
  getApiUrl: () => 'http://custom.com/api'
});
```

## Testes de Componentes

### Componente que Usa ConfigService

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">
      {{ user.name }}
    </div>
    <div *ngIf="isDebug">Debug Mode</div>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isDebug: boolean = false;

  constructor(
    private userService: UserService,
    private config: ConfigService
  ) {}

  ngOnInit() {
    this.isDebug = this.config.isDebugModeEnabled();
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }
}
```

### Testes do Componente

```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockConfig: jasmine.SpyObj<ConfigService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    mockConfig = jasmine.createSpyObj('ConfigService', [
      'isDebugModeEnabled'
    ]);
    
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);

    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: ConfigService, useValue: mockConfig },
        { provide: UserService, useValue: mockUserService }
      ]
    });

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should show debug mode when enabled', () => {
    mockConfig.isDebugModeEnabled.and.returnValue(true);
    mockUserService.getUsers.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.isDebug).toBe(true);
  });

  it('should hide debug mode when disabled', () => {
    mockConfig.isDebugModeEnabled.and.returnValue(false);
    mockUserService.getUsers.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.isDebug).toBe(false);
  });

  it('should call config service on init', () => {
    mockUserService.getUsers.and.returnValue(of([]));

    component.ngOnInit();

    expect(mockConfig.isDebugModeEnabled).toHaveBeenCalled();
  });
});
```

## Testes de Serviços

### Serviço que Usa ConfigService

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.apiUrl = this.config.getApiUrl();
  }

  getUsers(): Observable<User[]> {
    const url = this.config.buildEndpointUrl(API_ENDPOINTS.USERS.BASE);
    return this.http.get<User[]>(url);
  }

  getUserById(id: number): Observable<User> {
    const endpoint = API_ENDPOINTS.USERS.BY_ID(id);
    const url = this.config.buildEndpointUrl(endpoint);
    return this.http.get<User>(url);
  }
}
```

### Testes do Serviço

```typescript
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let mockConfig: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    mockConfig = jasmine.createSpyObj('ConfigService', [
      'getApiUrl',
      'buildEndpointUrl'
    ]);

    mockConfig.getApiUrl.and.returnValue('http://test.com/api/v1');
    mockConfig.buildEndpointUrl.and.callFake(
      (path: string) => `http://test.com/api/v1${path}`
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ConfigService, useValue: mockConfig }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use correct API URL', () => {
    expect(mockConfig.getApiUrl).toHaveBeenCalled();
  });

  it('should get users from correct endpoint', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('http://test.com/api/v1/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    expect(mockConfig.buildEndpointUrl).toHaveBeenCalledWith('/users');
  });

  it('should get user by id', () => {
    const mockUser: User = { id: 1, name: 'User 1' };

    service.getUserById(1).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://test.com/api/v1/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
```

## Testes de Guards

### Guard que Usa ConfigService

```typescript
@Injectable({ providedIn: 'root' })
export class DebugGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.config.isDebugModeEnabled()) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
```

### Testes do Guard

```typescript
describe('DebugGuard', () => {
  let guard: DebugGuard;
  let mockConfig: jasmine.SpyObj<ConfigService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockConfig = jasmine.createSpyObj('ConfigService', ['isDebugModeEnabled']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        DebugGuard,
        { provide: ConfigService, useValue: mockConfig },
        { provide: Router, useValue: mockRouter }
      ]
    });

    guard = TestBed.inject(DebugGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when debug mode is enabled', () => {
    mockConfig.isDebugModeEnabled.and.returnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when debug mode is disabled', () => {
    mockConfig.isDebugModeEnabled.and.returnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
```

## Testes de Interceptors

### Interceptor que Usa ConfigService

```typescript
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private config: ConfigService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith('http')) {
      const apiUrl = this.config.getApiUrl();
      req = req.clone({
        url: `${apiUrl}${req.url}`
      });
    }

    return next.handle(req);
  }
}
```

### Testes do Interceptor

```typescript
describe('ApiInterceptor', () => {
  let interceptor: ApiInterceptor;
  let mockConfig: jasmine.SpyObj<ConfigService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    mockConfig = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    mockConfig.getApiUrl.and.returnValue('http://test.com/api/v1');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiInterceptor,
        { provide: ConfigService, useValue: mockConfig },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true
        }
      ]
    });

    interceptor = TestBed.inject(ApiInterceptor);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add base URL to relative URLs', inject(
    [HttpClient],
    (http: HttpClient) => {
      http.get('/users').subscribe();

      const req = httpMock.expectOne('http://test.com/api/v1/users');
      expect(req.request.url).toBe('http://test.com/api/v1/users');
      
      req.flush([]);
    }
  ));

  it('should not modify absolute URLs', inject(
    [HttpClient],
    (http: HttpClient) => {
      http.get('http://other.com/api/users').subscribe();

      const req = httpMock.expectOne('http://other.com/api/users');
      expect(req.request.url).toBe('http://other.com/api/users');
      
      req.flush([]);
    }
  ));
});
```

## Testes de Feature Flags

### Serviço com Feature Flags

```typescript
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private config: ConfigService) {}

  track(event: string, data?: any): void {
    if (!this.config.isAnalyticsEnabled()) {
      return;
    }

    // Track event
    console.log('Tracking:', event, data);
  }
}
```

### Testes de Feature Flags

```typescript
describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockConfig: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    mockConfig = jasmine.createSpyObj('ConfigService', ['isAnalyticsEnabled']);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: ConfigService, useValue: mockConfig }
      ]
    });

    service = TestBed.inject(AnalyticsService);
  });

  it('should track when analytics is enabled', () => {
    mockConfig.isAnalyticsEnabled.and.returnValue(true);
    spyOn(console, 'log');

    service.track('page_view');

    expect(console.log).toHaveBeenCalledWith('Tracking:', 'page_view', undefined);
  });

  it('should not track when analytics is disabled', () => {
    mockConfig.isAnalyticsEnabled.and.returnValue(false);
    spyOn(console, 'log');

    service.track('page_view');

    expect(console.log).not.toHaveBeenCalled();
  });
});
```

## Testes de Ambientes

### Teste de Diferentes Ambientes

```typescript
describe('Environment Configuration', () => {
  it('should use development settings in dev environment', () => {
    const devConfig = new ConfigService();
    // Assuming environment is set to dev

    expect(devConfig.isProduction()).toBe(false);
    expect(devConfig.isDebugModeEnabled()).toBe(true);
    expect(devConfig.getApiBaseUrl()).toContain('localhost');
  });

  it('should use production settings in prod environment', () => {
    // Mock production environment
    const mockProdConfig = jasmine.createSpyObj('ConfigService', [
      'isProduction',
      'isDebugModeEnabled',
      'getApiBaseUrl'
    ]);

    mockProdConfig.isProduction.and.returnValue(true);
    mockProdConfig.isDebugModeEnabled.and.returnValue(false);
    mockProdConfig.getApiBaseUrl.and.returnValue('https://api.barberboss.com');

    expect(mockProdConfig.isProduction()).toBe(true);
    expect(mockProdConfig.isDebugModeEnabled()).toBe(false);
    expect(mockProdConfig.getApiBaseUrl()).toContain('https://');
  });
});
```

## Testes de Integração

### Teste de Fluxo Completo

```typescript
describe('User Authentication Flow', () => {
  let httpMock: HttpTestingController;
  let mockConfig: jasmine.SpyObj<ConfigService>;
  let authService: AuthService;

  beforeEach(() => {
    mockConfig = jasmine.createSpyObj('ConfigService', [
      'buildEndpointUrl',
      'getStorageKey'
    ]);

    mockConfig.buildEndpointUrl.and.callFake(
      (path: string) => `http://test.com/api/v1${path}`
    );
    mockConfig.getStorageKey.and.callFake(
      (key: string) => `test_${key}`
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfig }
      ]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should complete login flow with config service', () => {
    const credentials = { email: 'test@test.com', password: 'pass123' };
    const response = { token: 'abc123', refreshToken: 'xyz789' };

    authService.login(credentials).subscribe(res => {
      expect(res).toEqual(response);
      
      // Verify tokens were stored with correct keys
      const tokenKey = mockConfig.getStorageKey('token');
      const storedToken = localStorage.getItem(tokenKey);
      expect(storedToken).toBe(response.token);
    });

    const req = httpMock.expectOne('http://test.com/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    
    req.flush(response);

    expect(mockConfig.buildEndpointUrl).toHaveBeenCalledWith('/auth/login');
    expect(mockConfig.getStorageKey).toHaveBeenCalledWith('token');
  });
});
```

## Helpers de Teste

### Factory de Mock Config

```typescript
// test-helpers/config.mock.ts
export class ConfigServiceMockFactory {
  static create(overrides?: Partial<ConfigService>): jasmine.SpyObj<ConfigService> {
    const methods = [
      'getApiUrl',
      'getApiBaseUrl',
      'getApiTimeout',
      'buildEndpointUrl',
      'getTokenKey',
      'getRefreshTokenKey',
      'getStorageKey',
      'isDebugModeEnabled',
      'isAnalyticsEnabled',
      'isProduction',
      'getDefaultAppointmentDuration',
      'getItemsPerPage',
      'get'
    ];

    const mock = jasmine.createSpyObj('ConfigService', methods);

    // Default implementations
    mock.getApiUrl.and.returnValue('http://test.com/api/v1');
    mock.getApiBaseUrl.and.returnValue('http://test.com');
    mock.getApiTimeout.and.returnValue(30000);
    mock.buildEndpointUrl.and.callFake((path: string) => `http://test.com/api/v1${path}`);
    mock.getStorageKey.and.callFake((key: string) => `test_${key}`);
    mock.isDebugModeEnabled.and.returnValue(false);
    mock.isAnalyticsEnabled.and.returnValue(false);
    mock.isProduction.and.returnValue(false);
    mock.getDefaultAppointmentDuration.and.returnValue(60);
    mock.getItemsPerPage.and.returnValue(10);

    // Apply overrides
    if (overrides) {
      Object.keys(overrides).forEach(key => {
        if (mock[key] && mock[key].and) {
          mock[key].and.returnValue(overrides[key]);
        }
      });
    }

    return mock;
  }
}

// Usage
const mockConfig = ConfigServiceMockFactory.create({
  isDebugModeEnabled: () => true
});
```

---

## 📚 Recursos Adicionais

- **Testing Angular:** https://angular.io/guide/testing
- **Jasmine Docs:** https://jasmine.github.io/
- **HTTP Testing:** https://angular.io/guide/http#testing-http-requests

---

**Última Atualização:** 10/12/2025  
**Versão:** 1.0.0

Com estes exemplos, você pode testar completamente qualquer código que use ConfigService! 🧪
