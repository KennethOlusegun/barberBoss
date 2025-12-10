# HTTP Interceptors

## Visão Geral

Os HTTP Interceptors são componentes que interceptam requisições HTTP e respostas, permitindo modificá-las ou executar lógica adicional. Este projeto implementa 7 interceptors principais:

1. **TimeoutInterceptor** - Aplica timeout às requisições
2. **LoadingInterceptor** - Gerencia indicadores de carregamento
3. **AuthInterceptor** - Adiciona tokens de autenticação
4. **LoggingInterceptor** - Registra requisições/respostas (apenas desenvolvimento)
5. **RetryInterceptor** - Tenta novamente requisições falhas
6. **CachingInterceptor** - Armazena respostas GET em cache
7. **ErrorInterceptor** - Trata erros globalmente

## Ordem de Execução

Os interceptors são executados na ordem em que são registrados no `api.providers.ts`. A ordem é importante para garantir o comportamento correto:

```
Request Flow:
1. TimeoutInterceptor → Aplica timeout
2. LoadingInterceptor → Mostra loading
3. AuthInterceptor → Adiciona token
4. LoggingInterceptor → Loga request
5. RetryInterceptor → Prepara retry
6. CachingInterceptor → Verifica cache
7. ErrorInterceptor → Prepara error handling
   → Request enviado ao servidor

Response Flow:
7. ErrorInterceptor → Trata erros primeiro
6. CachingInterceptor → Armazena em cache
5. RetryInterceptor → Retry se necessário
4. LoggingInterceptor → Loga response
3. AuthInterceptor → Refresh token se 401
2. LoadingInterceptor → Esconde loading
1. TimeoutInterceptor → Valida timeout
   → Response retornado ao component
```

## Configuração

Os interceptors já estão configurados automaticamente no `main.ts`:

```typescript
import { provideApiHttpClient } from './app/core/services/api/api.providers';

bootstrapApplication(AppComponent, {
  providers: [
    provideApiHttpClient(),
    // ... outros providers
  ],
});
```

## Uso dos Interceptors

### 1. TimeoutInterceptor

Aplica timeout padrão de 30 segundos a todas as requisições.

**Configuração por requisição:**

```typescript
// Timeout customizado (15 segundos)
this.http.get('/api/data', {
  headers: { 'X-Timeout': '15000' }
}).subscribe();

// Desabilitar timeout
this.http.get('/api/long-operation', {
  headers: { 'X-Skip-Timeout': 'true' }
}).subscribe();
```

### 2. LoadingInterceptor

Mostra/esconde automaticamente indicador de carregamento durante requisições.

**Configuração por requisição:**

```typescript
// Desabilitar loading
this.http.get('/api/background-sync', {
  headers: { 'X-Skip-Loading': 'true' }
}).subscribe();

// Loading com mensagem customizada
this.http.post('/api/upload', data, {
  headers: { 'X-Loading-Message': 'Fazendo upload...' }
}).subscribe();
```

**Uso direto do LoadingService:**

```typescript
constructor(private loadingService: LoadingService) {}

async manualLoading() {
  await this.loadingService.show('Processando...');
  // ... operação
  await this.loadingService.hide();
}

// Verificar estado
this.loadingService.isLoading$.subscribe(isLoading => {
  console.log('Loading:', isLoading);
});
```

### 3. AuthInterceptor

Adiciona automaticamente o token JWT às requisições autenticadas.

**Funcionalidades:**
- Adiciona header `Authorization: Bearer <token>`
- Refresh automático de token em caso de 401
- Fila de requisições durante refresh
- Logout automático se refresh falhar

**Não requer configuração especial** - funciona automaticamente quando o usuário está autenticado.

### 4. LoggingInterceptor

Registra todas as requisições e respostas no console (apenas em modo desenvolvimento).

**Output de exemplo:**

```
🚀 HTTP Request: {
  method: 'GET',
  url: '/api/users',
  headers: {...},
  body: null
}

✅ HTTP Response: {
  method: 'GET',
  url: '/api/users',
  status: 200,
  duration: '345ms',
  body: [...]
}

❌ HTTP Error: {
  method: 'POST',
  url: '/api/login',
  status: 401,
  duration: '123ms',
  error: {...}
}
```

### 5. RetryInterceptor

Tenta novamente requisições falhas com backoff exponencial.

**Configuração padrão:**
- 3 tentativas máximas
- Delay inicial de 1 segundo
- Backoff exponencial (1s, 2s, 4s)
- Apenas erros retentáveis (408, 429, 5xx)

**Configuração por requisição:**

```typescript
// Customizar número de tentativas
this.http.get('/api/unstable', {
  headers: { 'X-Retry-Count': '5' }
}).subscribe();

// Customizar delay inicial
this.http.get('/api/data', {
  headers: { 'X-Retry-Delay': '2000' }
}).subscribe();

// Desabilitar retry
this.http.post('/api/critical', data, {
  headers: { 'X-Skip-Retry': 'true' }
}).subscribe();
```

**Códigos de status retentáveis:**
- 408 - Request Timeout
- 429 - Too Many Requests
- 500 - Internal Server Error
- 502 - Bad Gateway
- 503 - Service Unavailable
- 504 - Gateway Timeout

### 6. CachingInterceptor

Armazena respostas GET em cache para melhorar performance.

**Configuração padrão:**
- Apenas requisições GET
- Duração padrão: 5 minutos
- Cache em memória

**Configuração por requisição:**

```typescript
// Cache com duração customizada (10 minutos)
this.http.get('/api/static-data', {
  headers: { 'X-Cache-Duration': '600000' }
}).subscribe();

// Desabilitar cache
this.http.get('/api/real-time-data', {
  headers: { 'X-Cache-Duration': 'none' }
}).subscribe();
```

**Limpeza manual do cache:**

```typescript
constructor(private cachingInterceptor: CachingInterceptor) {}

// Limpar todo o cache
this.cachingInterceptor.clearCache();

// Limpar URL específica
this.cachingInterceptor.clearCacheForUrl('/api/users');
```

### 7. ErrorInterceptor

Trata erros HTTP globalmente com redirecionamento e logging.

**Tratamento por código de status:**

- **401 Unauthorized** - Limpa token e redireciona para login
- **403 Forbidden** - Loga erro de permissão
- **404 Not Found** - Loga URL não encontrada
- **500 Server Error** - Loga erro do servidor
- **Outros** - Loga erro genérico

**Não requer configuração especial** - funciona automaticamente.

## Exemplo Completo

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  // Requisição simples - todos os interceptors aplicados
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  // Sem loading e com cache longo
  getStaticConfig(): Observable<Config> {
    return this.http.get<Config>('/api/config', {
      headers: {
        'X-Skip-Loading': 'true',
        'X-Cache-Duration': '3600000' // 1 hora
      }
    });
  }

  // Upload com loading customizado e sem retry
  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>('/api/upload', formData, {
      headers: {
        'X-Loading-Message': 'Fazendo upload do arquivo...',
        'X-Skip-Retry': 'true',
        'X-Timeout': '60000' // 60 segundos
      }
    });
  }

  // Operação em background
  syncData(): Observable<void> {
    return this.http.post<void>('/api/sync', null, {
      headers: {
        'X-Skip-Loading': 'true',
        'X-Retry-Count': '5'
      }
    });
  }
}
```

## Boas Práticas

### 1. Loading Indicator
- Use `X-Skip-Loading: true` para operações em background
- Use mensagens customizadas para operações demoradas
- Não abuse - muitos loadings prejudicam UX

### 2. Cache
- Use cache para dados que não mudam frequentemente
- Limpe o cache após mutações (POST, PUT, DELETE)
- Evite cachear dados sensíveis

### 3. Retry
- Desabilite retry para operações críticas (pagamentos, etc)
- Use retry para operações idempotentes
- Ajuste o número de tentativas conforme necessidade

### 4. Timeout
- Aumente timeout para uploads e downloads
- Use timeout menor para operações rápidas
- Considere timeout zero para operações em tempo real

### 5. Headers Customizados
- Combine múltiplos headers para controle fino
- Documente headers customizados no código
- Use constantes para valores comuns

## Teste

### Testar Interceptors

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should add Authorization header', () => {
    // ... teste
  });
});
```

## Troubleshooting

### Loading não esconde
- Verifique se há erros não tratados
- Use `forceHide()` em casos de erro
- Verifique console para requests pendentes

### Cache não funciona
- Verifique se é requisição GET
- Confirme duração do cache
- Verifique se header está correto

### Retry infinito
- Verifique status code da resposta
- Confirme que não há loop de retry
- Use `X-Skip-Retry` se necessário

### Token não refresh
- Verifique implementação do AuthService
- Confirme endpoint de refresh
- Verifique logs do AuthInterceptor

## Próximos Passos

1. **Adicionar interceptor de compressão** para reduzir tamanho das requisições
2. **Implementar estratégia offline-first** com cache persistente
3. **Adicionar métricas e monitoramento** de performance
4. **Criar interceptor de rate limiting** no lado do cliente
5. **Implementar queue de requisições** para operações offline

## Referências

- [Angular HTTP Interceptors](https://angular.io/guide/http-intercept-requests-and-responses)
- [Ionic HTTP](https://ionicframework.com/docs/angular/http)
- [RxJS Operators](https://rxjs.dev/guide/operators)
