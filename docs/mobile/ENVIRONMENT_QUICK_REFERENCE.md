# Environment Configuration - Quick Reference

Referência rápida para uso diário do sistema de configuração.

## 📦 Import

```typescript
import { ConfigService } from "./core/services";
import { API_ENDPOINTS, STORAGE_KEYS } from "./core/constants";
```

## 🔧 Injeção

```typescript
constructor(private config: ConfigService) {}
```

## 🌐 API

```typescript
// URL completa da API
this.config.getApiUrl();
// => 'http://localhost:3000/api/v1'

// Base URL
this.config.getApiBaseUrl();
// => 'http://localhost:3000'

// Construir endpoint
this.config.buildEndpointUrl("/users");
// => 'http://localhost:3000/api/v1/users'

// Timeout
this.config.getApiTimeout();
// => 30000
```

## 🔐 Autenticação

```typescript
// Chaves de storage
this.config.getTokenKey();
// => 'barber_boss_token'

this.config.getRefreshTokenKey();
// => 'barber_boss_refresh_token'

// Tempo de expiração
this.config.getTokenExpirationTime();
// => 3600 (segundos)
```

## 📱 Aplicação

```typescript
// Nome
this.config.getAppName();
// => 'Barber Boss'

// Versão
this.config.getAppVersion();
// => '0.0.1'

// Idioma
this.config.getDefaultLanguage();
// => 'pt-BR'

// Idiomas suportados
this.config.getSupportedLanguages();
// => ['pt-BR', 'en-US']
```

## 🎚️ Feature Flags

```typescript
// Debug
this.config.isDebugModeEnabled();
// => true (dev) / false (prod)

// Analytics
this.config.isAnalyticsEnabled();
// => false (dev) / true (prod)

// Push Notifications
this.config.arePushNotificationsEnabled();
// => false (dev) / true (prod)

// Offline Mode
this.config.isOfflineModeEnabled();
// => true

// Genérico
this.config.isFeatureEnabled("enableDebugMode");
// => boolean
```

## 📊 Logging

```typescript
// Console logging
this.config.isConsoleLoggingEnabled();
// => true (dev) / false (prod)

// Log level
this.config.getLogLevel();
// => 'debug' (dev) / 'error' (prod)

// Remote logging
this.config.isRemoteLoggingEnabled();
// => false (dev) / true (prod)

// Log com debug
this.config.log("Message", data);
// Só loga se debug mode estiver ativo
```

## 💾 Storage

```typescript
// Prefixo
this.config.getStoragePrefix();
// => 'bb_'

// Tipo
this.config.getStorageType();
// => 'localStorage' (dev) / 'indexedDB' (prod)

// Chave com prefixo
this.config.getStorageKey("user");
// => 'bb_user'

// Uso completo
const key = this.config.getStorageKey(STORAGE_KEYS.USER);
localStorage.setItem(key, JSON.stringify(user));
```

## 💼 Regras de Negócio

```typescript
// Duração padrão do agendamento (minutos)
this.config.getDefaultAppointmentDuration();
// => 60

// Antecedência mínima (horas)
this.config.getMinAdvanceBooking();
// => 1

// Antecedência máxima (dias)
this.config.getMaxAdvanceBooking();
// => 30

// Prazo de cancelamento (horas)
this.config.getCancellationDeadline();
// => 2
```

## 🎨 UI/UX

```typescript
// Tema padrão
this.config.getDefaultTheme();
// => 'auto' | 'light' | 'dark'

// Animações
this.config.areAnimationsEnabled();
// => true

// Items por página
this.config.getItemsPerPage();
// => 10
```

## 🛠️ Utilitários

```typescript
// Config completa
this.config.getConfig();
// => Environment object

// Modo produção
this.config.isProduction();
// => false (dev) / true (prod)

// Acesso por path
this.config.get("api.baseUrl");
// => 'http://localhost:3000'

this.config.get("logging.logLevel");
// => 'debug'
```

## 📍 Constantes de API

```typescript
import { API_ENDPOINTS } from "./core/constants";

// Auth
API_ENDPOINTS.AUTH.LOGIN; // '/auth/login'
API_ENDPOINTS.AUTH.REGISTER; // '/auth/register'
API_ENDPOINTS.AUTH.REFRESH; // '/auth/refresh'

// Users
API_ENDPOINTS.USERS.BASE; // '/users'
API_ENDPOINTS.USERS.PROFILE; // '/users/profile'

// Appointments
API_ENDPOINTS.APPOINTMENTS.BASE; // '/appointments'
API_ENDPOINTS.APPOINTMENTS.BY_ID(1); // '/appointments/1'
API_ENDPOINTS.APPOINTMENTS.CANCEL(1); // '/appointments/1/cancel'

// Usage
const url = this.config.buildEndpointUrl(API_ENDPOINTS.AUTH.LOGIN);
```

## 🔑 Constantes de Storage

```typescript
import { STORAGE_KEYS } from "./core/constants";

STORAGE_KEYS.USER; // 'user'
STORAGE_KEYS.TOKEN; // 'token'
STORAGE_KEYS.REFRESH_TOKEN; // 'refresh_token'
STORAGE_KEYS.LANGUAGE; // 'language'
STORAGE_KEYS.THEME; // 'theme'

// Usage
const key = this.config.getStorageKey(STORAGE_KEYS.USER);
```

## 📅 Formatos de Data

```typescript
import { DATE_FORMATS } from "./core/constants";

DATE_FORMATS.DATE_SHORT; // 'DD/MM/YYYY'
DATE_FORMATS.DATE_LONG; // 'DD [de] MMMM [de] YYYY'
DATE_FORMATS.TIME; // 'HH:mm'
DATE_FORMATS.DATETIME; // 'DD/MM/YYYY HH:mm'
DATE_FORMATS.API_DATE; // 'YYYY-MM-DD'
DATE_FORMATS.API_ISO; // 'YYYY-MM-DDTHH:mm:ss.SSSZ'

// Usage com dayjs
dayjs(date).format(DATE_FORMATS.DATE_SHORT);
```

## 📊 Status de Agendamento

```typescript
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS
} from './core/constants';

APPOINTMENT_STATUS.PENDING          // 'pending'
APPOINTMENT_STATUS.CONFIRMED        // 'confirmed'

APPOINTMENT_STATUS_LABELS.PENDING   // 'Pendente'
APPOINTMENT_STATUS_COLORS.PENDING   // 'warning'

// Usage no template
<ion-badge [color]="APPOINTMENT_STATUS_COLORS[status]">
  {{ APPOINTMENT_STATUS_LABELS[status] }}
</ion-badge>
```

## ✅ Validação

```typescript
import { VALIDATION, REGEX_PATTERNS } from "./core/constants";

// Limites
VALIDATION.PASSWORD_MIN_LENGTH; // 8
VALIDATION.NAME_MIN_LENGTH; // 2
VALIDATION.PHONE_LENGTH; // 11

// Regex
REGEX_PATTERNS.EMAIL; // /^[^\s@]+@[^\s@]+\.[^\s@]+$/
REGEX_PATTERNS.PHONE; // /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/
REGEX_PATTERNS.PASSWORD; // Senha forte

// Usage
if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
  // Show error
}

if (!REGEX_PATTERNS.EMAIL.test(email)) {
  // Invalid email
}
```

## 💬 Mensagens

```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./core/constants";

// Erros
ERROR_MESSAGES.NETWORK_ERROR; // 'Erro de conexão...'
ERROR_MESSAGES.UNAUTHORIZED; // 'Sessão expirada...'

// Sucesso
SUCCESS_MESSAGES.LOGIN; // 'Login realizado...'
SUCCESS_MESSAGES.APPOINTMENT_CREATED; // 'Agendamento criado...'

// Usage
this.toastService.show(SUCCESS_MESSAGES.LOGIN);
```

## 🎨 Cores do Tema

```typescript
import { THEME_COLORS } from './core/constants';

THEME_COLORS.PRIMARY    // 'primary'
THEME_COLORS.SUCCESS    // 'success'
THEME_COLORS.DANGER     // 'danger'

// Usage no template
<ion-button [color]="THEME_COLORS.PRIMARY">
```

## 📆 Dias da Semana

```typescript
import {
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_LABELS,
  DAYS_OF_WEEK_SHORT,
} from "./core/constants";

DAYS_OF_WEEK.MONDAY; // 1
DAYS_OF_WEEK_LABELS.MONDAY; // 'Segunda-feira'
DAYS_OF_WEEK_SHORT.MONDAY; // 'Seg'
```

## 🔄 Padrões Comuns

### HTTP Interceptor

```typescript
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private config: ConfigService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!req.url.startsWith("http")) {
      const apiUrl = this.config.getApiUrl();
      req = req.clone({ url: `${apiUrl}${req.url}` });
    }
    return next.handle(req);
  }
}
```

### Auth Guard

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(): boolean {
    const tokenKey = this.config.getStorageKey(STORAGE_KEYS.TOKEN);
    const token = localStorage.getItem(tokenKey);
    return !!token;
  }
}
```

### Feature Guard

```typescript
@Injectable()
export class AnalyticsGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(): boolean {
    return this.config.isAnalyticsEnabled();
  }
}
```

### Conditional Feature

```typescript
ngOnInit() {
  if (this.config.isAnalyticsEnabled()) {
    this.analytics.initialize();
  }

  if (this.config.isDebugModeEnabled()) {
    this.logger.setLevel('debug');
  }
}
```

### Date Validation

```typescript
validateBookingDate(date: Date): boolean {
  const minHours = this.config.getMinAdvanceBooking();
  const maxDays = this.config.getMaxAdvanceBooking();

  const now = dayjs();
  const selected = dayjs(date);

  const hoursDiff = selected.diff(now, 'hours');
  const daysDiff = selected.diff(now, 'days');

  return hoursDiff >= minHours && daysDiff <= maxDays;
}
```

## 📝 Notas Importantes

1. **Sempre use ConfigService** ao invés de importar environment diretamente
2. **Use constantes** ao invés de strings hardcoded
3. **Prefixe chaves de storage** usando `getStorageKey()`
4. **Check feature flags** antes de usar features opcionais
5. **Use buildEndpointUrl()** para construir URLs de API
6. **Log apenas em debug mode** usando `config.log()`

## 🚨 Anti-patterns (Evite)

❌ **Não faça:**

```typescript
// Importar environment diretamente
import { environment } from "../environments/environment";

// Hardcode de URLs
const url = "http://localhost:3000/api/v1/users";

// Strings mágicas
localStorage.setItem("token", token);

// Código não configurável
if (true) {
  /* debug code */
}
```

✅ **Faça:**

```typescript
// Use ConfigService
constructor(private config: ConfigService) {}

// Use métodos do serviço
const url = this.config.buildEndpointUrl(API_ENDPOINTS.USERS.BASE);

// Use constantes com prefixo
const key = this.config.getStorageKey(STORAGE_KEYS.TOKEN);
localStorage.setItem(key, token);

// Use feature flags
if (this.config.isDebugModeEnabled()) { /* debug code */ }
```

---

**Última Atualização:** 10/12/2025  
**Versão:** 1.0.0

Para documentação completa, consulte `ENVIRONMENT_CONFIGURATION.md`
