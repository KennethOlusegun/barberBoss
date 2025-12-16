# Configuração de Ambiente - Mobile

## Visão Geral

O aplicativo mobile utiliza um sistema estruturado de configuração de ambiente que oferece:

- **Configuração com tipagem forte** usando interfaces TypeScript
- **Serviço de configuração centralizado** para acesso fácil
- **Configurações específicas por ambiente** (desenvolvimento e produção)
- **Feature flags** para ativar/desativar funcionalidades
- **Configuração de regras de negócio** para lógica da aplicação

## Arquitetura

### Estrutura de Arquivos

```
mobile/src/
├── environments/
│   ├── environment.interface.ts    # Interface TypeScript para segurança de tipos
│   ├── environment.ts              # Configuração de desenvolvimento
│   └── environment.prod.ts         # Configuração de produção
└── app/core/services/
    ├── config.service.ts           # Serviço de configuração
    └── config.service.spec.ts      # Testes unitários
```

## Seções de Configuração

### 1. Configuração da API

Controla as configurações de conexão com o backend:

```typescript
api: {
  baseUrl: string; // URL base da API do backend
  apiPrefix: string; // Prefixo de versão da API (ex: '/api/v1')
  timeout: number; // Timeout das requisições em milissegundos
}
```

**Development:**

- `baseUrl`: `http://localhost:3000`
- `apiPrefix`: `/api/v1`
- `timeout`: `30000` (30 seconds)

**Production:**

- `baseUrl`: `https://api.barberboss.com` (update before deploy)
- `apiPrefix`: `/api/v1`
- `timeout`: `30000`

### 2. Authentication Configuration

Manages authentication tokens and session:

```typescript
auth: {
  tokenKey: string; // Token storage key
  refreshTokenKey: string; // Refresh token storage key
  tokenExpirationTime: number; // Token expiration in seconds
}
```

### 3. Application Configuration

General application settings:

```typescript
app: {
  name: string;                  // Application name
  version: string;               // Application version
  defaultLanguage: string;       // Default language (e.g., 'pt-BR')
  supportedLanguages: string[];  // List of supported languages
}
```

### 4. Feature Flags

Enable or disable features:

```typescript
features: {
  enableDebugMode: boolean; // Debug mode with extra logging
  enableAnalytics: boolean; // Analytics tracking
  enablePushNotifications: boolean; // Push notifications
  enableOfflineMode: boolean; // Offline mode support
}
```

**Development:** Debug mode ON, Analytics OFF
**Production:** Debug mode OFF, Analytics ON

### 5. Logging Configuration

Controls application logging:

```typescript
logging: {
  enableConsoleLogging: boolean; // Console logging
  logLevel: "debug" | "info" | "warn" | "error";
  enableRemoteLogging: boolean; // Remote logging service
}
```

### 6. Storage Configuration

Defines storage strategy:

```typescript
storage: {
  prefix: string; // Prefix for storage keys
  type: "localStorage" | "indexedDB"; // Storage mechanism
}
```

### 7. Business Rules Configuration

Application-specific business logic:

```typescript
business: {
  defaultAppointmentDuration: number; // In minutes
  minAdvanceBooking: number; // Minimum hours in advance
  maxAdvanceBooking: number; // Maximum days in advance
  cancellationDeadline: number; // Hours before appointment
}
```

### 8. UI/UX Configuration

User interface settings:

```typescript
ui: {
  defaultTheme: "light" | "dark" | "auto";
  enableAnimations: boolean;
  itemsPerPage: number; // Pagination size
}
```

## Usage

### 1. Inject the Config Service

```typescript
import { Component } from "@angular/core";
import { ConfigService } from "./core/services/config.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent {
  constructor(private configService: ConfigService) {}

  ngOnInit() {
    // Access configuration
    const apiUrl = this.configService.getApiUrl();
    console.log("API URL:", apiUrl);
  }
}
```

### 2. Common Usage Examples

#### Get API URL

```typescript
// Get full API URL with prefix
const apiUrl = this.configService.getApiUrl();
// => 'http://localhost:3000/api/v1'

// Build endpoint URL
const usersEndpoint = this.configService.buildEndpointUrl("/users");
// => 'http://localhost:3000/api/v1/users'
```

#### Check Feature Flags

```typescript
// Check if debug mode is enabled
if (this.configService.isDebugModeEnabled()) {
  console.log("Debug mode is active");
}

// Check if analytics is enabled
if (this.configService.isAnalyticsEnabled()) {
  // Initialize analytics
}

// Generic feature check
if (this.configService.isFeatureEnabled("enablePushNotifications")) {
  // Setup push notifications
}
```

#### Storage Keys

```typescript
// Get prefixed storage key
const userKey = this.configService.getStorageKey("user");
// => 'bb_user'

// Store data with prefixed key
localStorage.setItem(userKey, JSON.stringify(userData));
```

#### Business Rules

```typescript
// Get appointment duration
const duration = this.configService.getDefaultAppointmentDuration();
// => 60 (minutes)

// Get cancellation deadline
const deadline = this.configService.getCancellationDeadline();
// => 2 (hours)
```

#### Configuration Access by Path

```typescript
// Get nested configuration using dot notation
const baseUrl = this.configService.get("api.baseUrl");
// => 'http://localhost:3000'

const logLevel = this.configService.get("logging.logLevel");
// => 'debug'
```

### 3. HTTP Interceptor Example

```typescript
import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from "@angular/common/http";
import { ConfigService } from "../services/config.service";

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Clone request and add base URL if needed
    if (!req.url.startsWith("http")) {
      const apiUrl = this.configService.getApiUrl();
      req = req.clone({
        url: `${apiUrl}${req.url}`,
      });
    }

    return next.handle(req);
  }
}
```

## Environment Setup

### Development Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update values in `.env` if needed

3. Run development server:

```bash
npm start
```

### Production Build

1. Update production values in `environment.prod.ts`:
   - Set correct `api.baseUrl`
   - Enable analytics
   - Disable debug mode
   - Enable remote logging

2. Build for production:

```bash
ng build --configuration production
```

## Best Practices

### 1. Never Hardcode Values

❌ **Bad:**

```typescript
const apiUrl = "http://localhost:3000/api/v1";
```

✅ **Good:**

```typescript
const apiUrl = this.configService.getApiUrl();
```

### 2. Use Feature Flags

```typescript
// Instead of commenting out code
if (this.configService.isFeatureEnabled("enableAnalytics")) {
  this.trackEvent("page_view");
}
```

### 3. Environment-Specific Logging

```typescript
if (this.configService.isDebugModeEnabled()) {
  console.log("Debug info:", data);
}
```

### 4. Type-Safe Configuration

Always use the `Environment` interface when working with configuration:

```typescript
import { Environment } from "./environment.interface";

const config: Environment = {
  // TypeScript will enforce all required properties
};
```

## Testing

The `ConfigService` includes comprehensive unit tests:

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Test Example

```typescript
it("should return API URL with prefix", () => {
  const apiUrl = service.getApiUrl();
  expect(apiUrl).toContain("/api/v1");
});
```

## Security Considerations

1. **Never commit sensitive data** to version control
2. Use environment variables for secrets in production
3. Keep `.env` files out of git (add to `.gitignore`)
4. Regularly rotate API keys and tokens
5. Use HTTPS in production (`https://` URLs)

## Migration Guide

If you have existing hardcoded values:

1. Identify all hardcoded configuration values
2. Add them to the appropriate section in `environment.ts` and `environment.prod.ts`
3. Replace hardcoded values with `ConfigService` calls
4. Test thoroughly

## Troubleshooting

### Issue: Configuration not loading

**Solution:** Ensure `ConfigService` is provided in `root`:

```typescript
@Injectable({
  providedIn: 'root',
})
```

### Issue: Different values in development and production

**Solution:** Check file replacements in `angular.json`:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

### Issue: TypeScript errors with configuration

**Solution:** Ensure you're importing the correct interface:

```typescript
import { Environment } from "./environment.interface";
```

## Future Enhancements

- [ ] Add remote configuration loading
- [ ] Implement configuration validation
- [ ] Add configuration change detection
- [ ] Support for multi-tenant configuration
- [ ] Configuration versioning
- [ ] A/B testing support

## Additional Resources

- [Angular Environment Configuration](https://angular.io/guide/build#configuring-application-environments)
- [Ionic Environment Variables](https://ionicframework.com/docs/angular/config)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)

## Support

For questions or issues, please contact the development team or create an issue in the project repository.
