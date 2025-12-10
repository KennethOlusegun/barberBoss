# HTTP Interceptors - Quick Reference

## ✅ Implementado

Os seguintes interceptors estão implementados e configurados automaticamente:

### 1. **TimeoutInterceptor** ⏱️
- Timeout padrão: 30 segundos
- Headers: `X-Timeout`, `X-Skip-Timeout`

### 2. **LoadingInterceptor** 🔄
- Mostra/esconde loading automaticamente
- Headers: `X-Skip-Loading`, `X-Loading-Message`

### 3. **AuthInterceptor** 🔐
- Adiciona token JWT automaticamente
- Refresh automático em 401
- Headers: Automático via `Authorization`

### 4. **LoggingInterceptor** 📝
- Loga requests/responses (apenas dev)
- Automático - sem configuração necessária

### 5. **RetryInterceptor** 🔁
- Retry automático com backoff exponencial
- Padrão: 3 tentativas, 1s inicial
- Headers: `X-Retry-Count`, `X-Retry-Delay`, `X-Skip-Retry`

### 6. **CachingInterceptor** 💾
- Cache de requisições GET
- Padrão: 5 minutos
- Headers: `X-Cache-Duration`

### 7. **ErrorInterceptor** ❌
- Tratamento global de erros
- Redirecionamento em 401
- Automático - sem configuração necessária

## 🚀 Uso Rápido

```typescript
// Request básico - todos os interceptors aplicados
this.http.get('/api/users').subscribe();

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

// Sem retry (crítico)
this.http.post('/api/payment', data, {
  headers: { 'X-Skip-Retry': 'true' }
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

## 📋 Headers Disponíveis

| Header | Valores | Descrição |
|--------|---------|-----------|
| `X-Timeout` | milliseconds | Timeout customizado |
| `X-Skip-Timeout` | `'true'` | Desabilita timeout |
| `X-Skip-Loading` | `'true'` | Desabilita loading |
| `X-Loading-Message` | string | Mensagem customizada |
| `X-Retry-Count` | number | Número de tentativas |
| `X-Retry-Delay` | milliseconds | Delay inicial |
| `X-Skip-Retry` | `'true'` | Desabilita retry |
| `X-Cache-Duration` | milliseconds ou `'none'` | Duração do cache |

## 📖 Documentação Completa

Veja [HTTP_INTERCEPTORS.md](../../../docs/mobile/HTTP_INTERCEPTORS.md) para documentação detalhada.

## 📂 Arquivos

```
mobile/src/app/core/
├── services/
│   ├── loading.service.ts          # Serviço de loading
│   └── api/
│       ├── api.providers.ts        # Configuração dos interceptors
│       └── interceptors/
│           ├── auth.interceptor.ts
│           ├── error.interceptor.ts
│           ├── logging.interceptor.ts
│           ├── caching.interceptor.ts
│           ├── retry.interceptor.ts
│           ├── loading.interceptor.ts
│           ├── timeout.interceptor.ts
│           └── index.ts
└── examples/
    └── interceptor-usage.service.ts # Exemplos de uso
```

## 🎯 Ordem de Execução

```
Request:  Timeout → Loading → Auth → Logging → Retry → Cache → Error → Server
Response: Error → Cache → Retry → Logging → Auth → Loading → Timeout → Component
```

## 💡 Boas Práticas

1. ✅ Use `X-Skip-Loading` para operações em background
2. ✅ Desabilite retry para operações críticas (pagamentos)
3. ✅ Use cache para dados estáticos
4. ✅ Customize timeout para uploads/downloads
5. ✅ Combine headers para controle fino
6. ❌ Não abuse de loadings (prejudica UX)
7. ❌ Não cache dados sensíveis
8. ❌ Não use retry em operações não-idempotentes

## 🧪 Teste

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideApiHttpClient } from './core/services/api/api.providers';

describe('Service with Interceptors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideApiHttpClient()],
    });
  });
});
```

## 🔧 Configuração

Já está configurado em `main.ts`:

```typescript
import { provideApiHttpClient } from './app/core/services/api/api.providers';

bootstrapApplication(AppComponent, {
  providers: [
    provideApiHttpClient(), // ✅ Todos os interceptors
  ],
});
```

## 🐛 Troubleshooting

### Loading não esconde
```typescript
// Use forceHide() em caso de erro
await this.loadingService.forceHide();
```

### Cache não funciona
- Verifique se é GET request
- Confirme duração com `X-Cache-Duration`
- Use `clearCache()` após mutações

### Retry infinito
- Use `X-Skip-Retry: 'true'` em operações críticas
- Verifique códigos de status retentáveis

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa ou verifique os exemplos em `examples/interceptor-usage.service.ts`.
