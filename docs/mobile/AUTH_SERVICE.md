# Auth Service - BarberBoss Mobile

## 📋 Visão Geral

O Auth Service é o serviço centralizado de autenticação para o aplicativo mobile BarberBoss. Ele gerencia todo o ciclo de vida da autenticação do usuário, incluindo login, registro, logout, gerenciamento de tokens JWT e controle de estado de autenticação.

## 🚀 Recursos Implementados

### ✅ Funcionalidades Principais

- **Login/Register/Logout** - Autenticação completa de usuários
- **Gerenciamento de Token JWT** - Armazenamento, validação e refresh automático
- **Gerenciamento de Estado** - State management reativo com RxJS
- **Verificação de Roles** - Suporte para ADMIN, BARBER e CLIENT
- **Persistência Local** - Armazenamento seguro no localStorage
- **HTTP Interceptor** - Injeção automática de token em requisições
- **Guards de Rota** - Proteção de rotas por autenticação e role
- **Recuperação de Senha** - Fluxo completo de reset de senha

## 📦 Estrutura de Arquivos

```
core/
├── services/
│   └── auth/
│       ├── auth.service.ts          # Serviço principal
│       ├── auth.types.ts            # Tipos e interfaces
│       ├── auth.config.ts           # Configurações
│       ├── auth.service.spec.ts     # Testes unitários
│       └── index.ts                 # Barrel export
├── interceptors/
│   ├── auth.interceptor.ts          # Interceptor HTTP
│   └── index.ts
└── guards/
    ├── auth.guard.ts                # Guard de autenticação
    ├── guest.guard.ts               # Guard para visitantes
    ├── role.guard.ts                # Guard baseado em roles
    └── index.ts
```

## 🔧 Uso Básico

### 1. Importação

```typescript
import { AuthService, UserRole } from "@core";
```

### 2. Login

```typescript
import { Component } from "@angular/core";
import { AuthService } from "@core";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
})
export class LoginPage {
  constructor(private authService: AuthService) {}

  login(email: string, password: string) {
    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        console.log("Login successful:", user);
        // Redirecionar para home
      },
      error: (error) => {
        console.error("Login failed:", error);
        // Mostrar mensagem de erro
      },
    });
  }
}
```

### 3. Registro

```typescript
register() {
  const data = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'senha123',
    phone: '(11) 98765-4321',
    role: UserRole.CLIENT, // Opcional, default é CLIENT
  };

  this.authService.register(data).subscribe({
    next: (user) => {
      console.log('Registro successful:', user);
    },
    error: (error) => {
      console.error('Registro failed:', error);
    },
  });
}
```

### 4. Logout

```typescript
logout() {
  this.authService.logout().subscribe(() => {
    console.log('Logout successful');
    // Redirecionar para login
  });
}
```

### 5. Verificar Autenticação

```typescript
// Observable
this.authService.isAuthenticated$.subscribe((isAuth) => {
  console.log("Is authenticated:", isAuth);
});

// Síncrono
if (this.authService.isAuthenticated()) {
  console.log("User is authenticated");
}
```

### 6. Obter Usuário Atual

```typescript
// Observable
this.authService.user$.subscribe((user) => {
  if (user) {
    console.log("Current user:", user.name, user.role);
  }
});

// Buscar do servidor
this.authService.getCurrentUser().subscribe((user) => {
  console.log("User profile:", user);
});
```

### 7. Verificar Roles

```typescript
// Verificar role específica
if (this.authService.hasRole(UserRole.ADMIN)) {
  console.log("User is admin");
}

// Verificar múltiplas roles
if (this.authService.hasAnyRole([UserRole.ADMIN, UserRole.BARBER])) {
  console.log("User is admin or barber");
}

// Obter role atual
const role = this.authService.getUserRole();
console.log("User role:", role);
```

### 8. Gerenciamento de Senha

```typescript
// Mudar senha
changePassword() {
  const data = {
    currentPassword: 'senha_antiga',
    newPassword: 'senha_nova',
  };

  this.authService.changePassword(data).subscribe({
    next: () => console.log('Password changed'),
    error: (error) => console.error('Failed:', error),
  });
}

// Solicitar reset de senha
requestReset() {
  this.authService.requestPasswordReset({
    email: 'user@example.com'
  }).subscribe({
    next: () => console.log('Reset email sent'),
    error: (error) => console.error('Failed:', error),
  });
}

// Confirmar reset com token
confirmReset() {
  this.authService.confirmPasswordReset({
    token: 'reset-token-from-email',
    newPassword: 'nova_senha',
  }).subscribe({
    next: () => console.log('Password reset successful'),
    error: (error) => console.error('Failed:', error),
  });
}
```

## 🛡️ Guards

### AuthGuard - Proteger rotas autenticadas

```typescript
import { Routes } from "@angular/router";
import { AuthGuard } from "@core";

export const routes: Routes = [
  {
    path: "profile",
    loadComponent: () => import("./profile/profile.page"),
    canActivate: [AuthGuard], // Requer autenticação
  },
];
```

### GuestGuard - Proteger rotas de visitantes

```typescript
export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./login/login.page"),
    canActivate: [GuestGuard], // Apenas não autenticados
  },
];
```

### RoleGuard - Proteger por role

```typescript
import { UserRole } from "@core";

export const routes: Routes = [
  {
    path: "admin",
    loadComponent: () => import("./admin/admin.page"),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] }, // Apenas admin
  },
  {
    path: "appointments",
    loadComponent: () => import("./appointments/appointments.page"),
    canActivate: [RoleGuard],
    data: {
      roles: [UserRole.ADMIN, UserRole.BARBER], // Admin ou Barber
    },
  },
];
```

## 🔌 HTTP Interceptor

O `AuthInterceptor` é configurado automaticamente no `app.config.ts`:

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthInterceptor } from "@core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([AuthInterceptor])),
    // ... outros providers
  ],
};
```

O interceptor automaticamente:

- ✅ Adiciona o token JWT ao header `Authorization`
- ✅ Trata erros 401 (Unauthorized)
- ✅ Faz refresh automático do token quando necessário
- ✅ Enfileira requisições durante o refresh

## 📊 State Management

O AuthService expõe vários observables para monitorar o estado:

```typescript
// Estado completo de autenticação
authService.authState$.subscribe((state) => {
  console.log("Auth state:", {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    token: state.token,
    loading: state.loading,
  });
});

// Apenas usuário
authService.user$.subscribe((user) => {
  console.log("User:", user);
});

// Apenas status de autenticação
authService.isAuthenticated$.subscribe((isAuth) => {
  console.log("Is authenticated:", isAuth);
});

// Estado de loading
authService.loading$.subscribe((loading) => {
  console.log("Loading:", loading);
});
```

## 🔐 Segurança

### Token Storage

Os tokens são armazenados com segurança no localStorage:

- `barber_boss_token` - Token JWT de acesso
- `barber_boss_refresh_token` - Token de refresh
- `barber_boss_user` - Dados do usuário

### Token Validation

O serviço valida automaticamente:

- ✅ Formato do token JWT
- ✅ Expiração do token
- ✅ Integridade do payload

### Token Refresh

O refresh acontece automaticamente quando:

- Token está próximo da expiração (5 minutos)
- Requisição retorna 401 Unauthorized
- Múltiplas requisições são enfileiradas durante refresh

## 🧪 Testes

Execute os testes unitários:

```bash
ng test
```

Os testes cobrem:

- ✅ Login/Register/Logout
- ✅ Token management
- ✅ Role verification
- ✅ State management
- ✅ Error handling

## 🎯 Próximos Passos

1. **Configurar Interceptor** - Adicionar no `app.config.ts`
2. **Criar Páginas de Auth** - Login, Register, Password Reset
3. **Implementar Guards** - Aplicar nas rotas necessárias
4. **Adicionar Loading States** - Usar `loading$` observable
5. **Implementar Error Handling** - Mensagens de erro amigáveis
6. **Adicionar Biometria** (Opcional) - Face ID / Touch ID

## 📚 Recursos Adicionais

- [Angular HTTP Client](https://angular.io/guide/http)
- [RxJS Observables](https://rxjs.dev/guide/observable)
- [JWT.io](https://jwt.io/) - Decode e debug JWT tokens
- [Ionic Storage](https://ionicframework.com/docs/angular/storage) - Para storage mais robusto

## 🐛 Troubleshooting

### Token não está sendo enviado

Verifique se o `AuthInterceptor` está configurado no `app.config.ts`.

### Login não persiste após refresh

Verifique se o localStorage está habilitado no navegador.

### 401 Unauthorized contínuo

Verifique se o backend está retornando o token correto e se a URL da API está configurada corretamente no `environment.ts`.

### Refresh token não funciona

Verifique se o backend suporta o endpoint `/auth/refresh` e se está retornando um novo token.

---

**Desenvolvido para BarberBoss Mobile** 💈📱
