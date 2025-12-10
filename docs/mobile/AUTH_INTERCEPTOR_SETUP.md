# Configuração do Auth Interceptor

## Como Configurar

Para que o `AuthInterceptor` funcione corretamente, ele precisa ser registrado no arquivo de configuração principal da aplicação.

### Angular 17+ (Standalone)

Edite o arquivo `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular(),
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
```

### Angular 16 ou anterior (NgModule)

Se ainda estiver usando NgModule, edite o arquivo `src/app/app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Verificar Funcionamento

Para verificar se o interceptor está funcionando:

1. **Faça login** no aplicativo
2. **Abra DevTools** (F12)
3. **Vá para a aba Network**
4. **Faça uma requisição** para o backend
5. **Verifique o header** `Authorization: Bearer <token>`

O header deve aparecer automaticamente em todas as requisições após o login.

## Troubleshooting

### Interceptor não está sendo aplicado

**Problema:** Token não aparece nas requisições.

**Solução:**
- Verifique se o interceptor está registrado corretamente
- Certifique-se de que `HttpClientModule` ou `provideHttpClient()` está importado
- Reinicie o servidor de desenvolvimento

### Múltiplos interceptors

Se você tiver outros interceptors, a ordem importa:

```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LoggingInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
  },
]
```

Recomendação de ordem:
1. Logging Interceptor (para debug)
2. Auth Interceptor (adiciona token)
3. Error Interceptor (trata erros)

### Rotas públicas

Se precisar de rotas sem autenticação, você pode adicionar lógica no interceptor:

```typescript
// Em auth.interceptor.ts
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Lista de URLs públicas
  const publicUrls = ['/auth/login', '/auth/register'];
  
  // Verifica se é rota pública
  const isPublicUrl = publicUrls.some(url => request.url.includes(url));
  
  if (isPublicUrl) {
    return next.handle(request);
  }
  
  // Adiciona token apenas para rotas privadas
  const token = this.authService.getToken();
  if (token) {
    request = this.addTokenToRequest(request, token);
  }
  
  return next.handle(request);
}
```

## Testando

Para testar o interceptor:

```bash
ng test
```

Ou crie um teste manual:

```typescript
// Em qualquer componente
constructor(
  private http: HttpClient,
  private authService: AuthService
) {
  // Fazer login
  this.authService.login({
    email: 'test@test.com',
    password: 'password'
  }).subscribe(() => {
    // Fazer uma requisição de teste
    this.http.get('/api/v1/users/me').subscribe(
      data => console.log('Success:', data),
      error => console.error('Error:', error)
    );
  });
}
```

Verifique no Network tab se o header `Authorization` foi adicionado automaticamente.
