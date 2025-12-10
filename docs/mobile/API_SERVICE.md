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

## Localização

```
mobile/src/app/core/services/api/
├── api.service.ts              # Serviço principal
├── api.service.spec.ts         # Testes
├── api.types.ts                # Tipos e interfaces
├── api.config.ts               # Configurações
├── api.providers.ts            # Providers HTTP
├── index.ts                    # Exports
├── README.md                   # Documentação completa
├── interceptors/
│   ├── auth.interceptor.ts
│   ├── error.interceptor.ts
│   ├── logging.interceptor.ts
│   ├── caching.interceptor.ts
│   ├── retry.interceptor.ts
│   ├── loading.interceptor.ts
│   ├── timeout.interceptor.ts
│   └── index.ts
└── examples/
    ├── user.service.example.ts
    └── component.example.ts
```

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

## Interceptors

O serviço inclui 7 interceptors automáticos:

### 1. Auth Interceptor 🔐
- Adiciona automaticamente o token JWT nas requisições
- Refresh automático em 401
- Adiciona headers padrão (Content-Type, Accept)

### 2. Error Interceptor ❌
- Trata erros globalmente
- Redireciona para login em caso de 401
- Logs de erro em desenvolvimento

### 3. Logging Interceptor 📝
- Loga todas as requisições e respostas
- Mede duração das requisições
- Ativo apenas em modo de desenvolvimento

### 4. Caching Interceptor 💾
- Cache automático para requisições GET
- Configurável via header `X-Cache-Duration`
- Cache de 5 minutos por padrão

### 5. Retry Interceptor 🔁
- Retry automático com backoff exponencial
- Padrão: 3 tentativas, 1s inicial
- Headers: `X-Retry-Count`, `X-Retry-Delay`, `X-Skip-Retry`

### 6. Loading Interceptor 🔄
- Mostra/esconde loading automaticamente
- Headers: `X-Skip-Loading`, `X-Loading-Message`

### 7. Timeout Interceptor ⏱️
- Timeout padrão: 30 segundos
- Headers: `X-Timeout`, `X-Skip-Timeout`

## Headers de Controle

| Header | Valores | Descrição |
|--------|---------|-----------|
| `X-Timeout` | milliseconds | Timeout customizado |
| `X-Skip-Timeout` | `'true'` | Desabilita timeout |
| `X-Skip-Loading` | `'true'` | Desabilita loading |
| `X-Loading-Message` | string | Mensagem customizada |
| `X-Retry-Count` | number | Número de tentativas |
| `X-Retry-Delay` | milliseconds | Delay inicial |
| `X-Skip-Retry` | `'true'` | Desabilita retry |
| `X-Cache-Duration` | milliseconds | Duração do cache |

## Exemplos de Uso com Headers

```typescript
// Sem loading
this.http.get('/api/data', {
  headers: { 'X-Skip-Loading': 'true' }
}).subscribe();

// Loading customizado
this.http.post('/api/upload', data, {
  headers: { 'X-Loading-Message': 'Fazendo upload...' }
}).subscribe();

// Mais retries
this.http.get('/api/unstable', {
  headers: { 'X-Retry-Count': '5' }
}).subscribe();

// Cache longo
this.http.get('/api/config', {
  headers: { 'X-Cache-Duration': '3600000' } // 1 hora
}).subscribe();

// Timeout customizado
this.http.get('/api/long', {
  headers: { 'X-Timeout': '120000' } // 2 minutos
}).subscribe();
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
}
```

### 2. Usar RxJS Operators

```typescript
import { map, catchError, tap } from 'rxjs/operators';

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

## Documentação Completa

Para documentação detalhada, exemplos adicionais e referência completa da API, consulte:
- `mobile/src/app/core/services/api/README.md`
- `mobile/src/app/core/services/api/interceptors/README.md`

## Referências

- [Angular HttpClient](https://angular.io/guide/http)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- Ver também: [HTTP_INTERCEPTORS.md](./HTTP_INTERCEPTORS.md) para detalhes sobre interceptors
