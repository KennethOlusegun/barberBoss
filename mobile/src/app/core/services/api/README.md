# API Service

Serviço base de API para o aplicativo mobile BarberBoss. Fornece uma camada de abstração robusta para comunicação HTTP com o backend.

## Características

- ✅ **Type-Safe**: Totalmente tipado com TypeScript
- 🔄 **Retry Automático**: Retry inteligente em caso de falhas
- 🔐 **Autenticação**: Injeção automática de token JWT
- ⚠️ **Tratamento de Erros**: Sistema robusto de tratamento de erros
- 📊 **Logging**: Logs detalhados em modo de desenvolvimento
- 💾 **Cache**: Cache configurável para requisições GET
- ⏱️ **Timeout**: Timeout configurável por requisição
- 📈 **Progress Tracking**: Rastreamento de progresso de uploads

## Instalação e Configuração

### 1. Configurar Providers

No arquivo `app.config.ts`, adicione o provider HTTP:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideApiHttpClient } from './core/services/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideApiHttpClient(),
    // ... outros providers
  ]
};
```

### 2. Configurar Variáveis de Ambiente

Certifique-se de que seu arquivo `environment.ts` contém as configurações da API:

```typescript
export const environment = {
  production: false,
  api: {
    baseUrl: 'http://localhost:3000',
    apiPrefix: '/api/v1',
    timeout: 30000,
  },
  // ...
};
```

## Uso Básico

### Injetar o Serviço

```typescript
import { Component, inject } from '@angular/core';
import { ApiService } from './core/services';

@Component({
  selector: 'app-users',
  template: '...'
})
export class UsersComponent {
  private apiService = inject(ApiService);
  
  // ou via construtor
  constructor(private apiService: ApiService) {}
}
```

### GET Request

```typescript
// Simples
this.apiService.get<User>('/users/123').subscribe({
  next: (user) => console.log(user),
  error: (error) => console.error(error)
});

// Com parâmetros
this.apiService.get<User[]>('/users', {
  params: {
    page: 1,
    limit: 10,
    search: 'John'
  }
}).subscribe(users => console.log(users));

// Com cache
this.apiService.get<Settings>('/settings', {
  headers: {
    'X-Cache-Duration': '300000' // 5 minutos
  }
}).subscribe(settings => console.log(settings));
```

### POST Request

```typescript
const userData = {
  name: 'John Doe',
  email: 'john@example.com'
};

this.apiService.post<User>('/users', userData, {
  requiresAuth: true
}).subscribe({
  next: (user) => console.log('Usuário criado:', user),
  error: (error) => console.error('Erro:', error)
});
```

### PUT/PATCH Request

```typescript
const updates = {
  name: 'Jane Doe'
};

// PUT - substitui o recurso completo
this.apiService.put<User>('/users/123', updates).subscribe();

// PATCH - atualização parcial
this.apiService.patch<User>('/users/123', updates).subscribe();
```

### DELETE Request

```typescript
this.apiService.delete('/users/123').subscribe({
  next: () => console.log('Usuário deletado'),
  error: (error) => console.error('Erro ao deletar:', error)
});
```

## Funcionalidades Avançadas

### Upload de Arquivo

```typescript
uploadProfilePicture(file: File, userId: string) {
  this.apiService.uploadFile<{ url: string }>(
    `/users/${userId}/avatar`,
    file,
    'avatar',
    { userId }
  ).subscribe({
    next: (response) => console.log('Avatar URL:', response.url),
    error: (error) => console.error('Erro no upload:', error)
  });
}
```

### Download de Arquivo

```typescript
downloadReport() {
  this.apiService.downloadFile(
    '/reports/monthly',
    'relatorio-mensal.pdf'
  ).subscribe({
    next: (blob) => console.log('Download completo'),
    error: (error) => console.error('Erro no download:', error)
  });
}
```

### Retry Customizado

```typescript
this.apiService.get<Data>('/data', {
  retry: true,
  retryAttempts: 5,
  retryDelay: 2000 // 2 segundos entre tentativas
}).subscribe();
```

### Timeout Customizado

```typescript
this.apiService.get<Data>('/slow-endpoint', {
  timeout: 60000 // 60 segundos
}).subscribe();
```

### Handler de Erro Customizado

```typescript
this.apiService.post<User>('/users', userData, {
  errorHandler: (error) => {
    if (error.code === 'VALIDATION_ERROR') {
      this.showValidationErrors(error.details);
    }
  }
}).subscribe();
```

### Requisição Sem Autenticação

```typescript
// Por padrão, todas as requisições incluem o token de autenticação
// Para desabilitar:
this.apiService.post<AuthResponse>('/auth/login', credentials, {
  requiresAuth: false
}).subscribe();
```

## Paginação

```typescript
interface UsersResponse {
  data: User[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

loadUsers(page: number = 1) {
  this.apiService.get<UsersResponse>('/users', {
    params: { page, limit: 20 }
  }).subscribe({
    next: (response) => {
      this.users = response.data;
      this.totalPages = response.meta.totalPages;
    }
  });
}
```

## Tratamento de Erros

O serviço fornece uma estrutura consistente para erros:

```typescript
this.apiService.get<User>('/users/123').subscribe({
  error: (error: ApiError) => {
    console.log('Status:', error.status);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    console.log('Details:', error.details);
    
    switch (error.code) {
      case ApiErrorCode.UNAUTHORIZED:
        this.router.navigate(['/login']);
        break;
      case ApiErrorCode.NOT_FOUND:
        this.showNotFoundMessage();
        break;
      case ApiErrorCode.VALIDATION_ERROR:
        this.displayValidationErrors(error.details);
        break;
    }
  }
});
```

## Códigos de Erro

```typescript
enum ApiErrorCode {
  // Erros de rede
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Erros do cliente (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Erros do servidor (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Erros da aplicação
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  CANCELLED = 'CANCELLED',
}
```

## Loading State

```typescript
export class UsersComponent {
  isLoading = false;
  
  loadUsers() {
    this.isLoading = true;
    
    this.apiService.get<User[]>('/users').subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
      }
    });
  }
  
  // Ou use o contador de requisições ativas
  get isLoadingAny() {
    return this.apiService.isLoading();
  }
}
```

## Interceptors

O serviço inclui 4 interceptors:

### 1. Auth Interceptor
- Adiciona automaticamente o token JWT nas requisições
- Adiciona headers padrão (Content-Type, Accept)

### 2. Error Interceptor
- Trata erros globalmente
- Redireciona para login em caso de 401
- Logs de erro em desenvolvimento

### 3. Logging Interceptor
- Loga todas as requisições e respostas
- Mede duração das requisições
- Ativo apenas em modo de desenvolvimento

### 4. Caching Interceptor
- Cache automático para requisições GET
- Configurável via header `X-Cache-Duration`
- Cache de 5 minutos por padrão

## Endpoints Predefinidos

```typescript
import { API_ENDPOINTS } from './core/services/api';

// Uso
this.apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
this.apiService.get(API_ENDPOINTS.USER.PROFILE);
```

## Boas Práticas

### 1. Criar Serviços Específicos

Em vez de usar o ApiService diretamente nos componentes, crie serviços específicos:

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private apiService: ApiService) {}
  
  getUser(id: string): Observable<User> {
    return this.apiService.get<User>(`/users/${id}`);
  }
  
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.apiService.patch<User>(`/users/${id}`, data);
  }
  
  deleteUser(id: string): Observable<void> {
    return this.apiService.delete(`/users/${id}`);
  }
}
```

### 2. Usar RxJS Operators

```typescript
import { map, catchError, retry, tap } from 'rxjs/operators';

getUserProfile(): Observable<UserProfile> {
  return this.apiService.get<User>('/user/profile').pipe(
    map(user => this.transformUserToProfile(user)),
    tap(profile => this.cacheProfile(profile)),
    catchError(error => {
      this.handleProfileError(error);
      return throwError(() => error);
    })
  );
}
```

### 3. Unsubscribe Adequadamente

```typescript
// Use takeUntil para gerenciar subscriptions
private destroy$ = new Subject<void>();

ngOnInit() {
  this.apiService.get<User[]>('/users')
    .pipe(takeUntil(this.destroy$))
    .subscribe(users => this.users = users);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Ou use async pipe no template
users$ = this.apiService.get<User[]>('/users');
```

## Testes

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('UserService', () => {
  let service: UserService;
  let apiService: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, ApiService]
    });

    service = TestBed.inject(UserService);
    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch user', () => {
    const mockUser = { id: '1', name: 'John' };

    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

## Suporte e Contribuição

Para reportar problemas ou sugerir melhorias, abra uma issue no repositório do projeto.
