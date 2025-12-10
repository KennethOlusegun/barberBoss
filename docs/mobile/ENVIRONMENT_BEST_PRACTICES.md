# Environment Configuration - Best Practices

Guia de boas práticas para trabalhar com configuração de ambiente no Barber Boss Mobile.

## 🎯 Princípios Fundamentais

### 1. Única Fonte de Verdade
**Sempre use ConfigService para acessar configurações.**

✅ **Correto:**
```typescript
constructor(private config: ConfigService) {}

const apiUrl = this.config.getApiUrl();
```

❌ **Incorreto:**
```typescript
import { environment } from '../environments/environment';

const apiUrl = environment.api.baseUrl;
```

**Por quê?**
- Centralização: Uma única fonte de configuração
- Testabilidade: Fácil de mockar em testes
- Manutenibilidade: Mudanças em um só lugar
- Type Safety: IntelliSense e validação de tipos

### 2. Use Constantes, Não Strings
**Evite strings mágicas no código.**

✅ **Correto:**
```typescript
import { STORAGE_KEYS, API_ENDPOINTS } from './core/constants';

const key = this.config.getStorageKey(STORAGE_KEYS.TOKEN);
const url = this.config.buildEndpointUrl(API_ENDPOINTS.AUTH.LOGIN);
```

❌ **Incorreto:**
```typescript
const key = 'bb_token';
const url = 'http://localhost:3000/api/v1/auth/login';
```

**Por quê?**
- Sem typos: Erros detectados em compile-time
- Refatoração segura: Mudar em um lugar atualiza tudo
- IntelliSense: Auto-complete ajuda na produtividade
- Documentação: Constantes documentam valores válidos

### 3. Feature Flags para Código Condicional
**Use flags ao invés de comentar/descomentar código.**

✅ **Correto:**
```typescript
if (this.config.isDebugModeEnabled()) {
  console.log('User data:', user);
}

if (this.config.isAnalyticsEnabled()) {
  this.analytics.track('page_view');
}
```

❌ **Incorreto:**
```typescript
// console.log('User data:', user); // Comentado manualmente

// if (environment.production) {
//   this.analytics.track('page_view');
// }
```

**Por quê?**
- Flexibilidade: Liga/desliga features facilmente
- Testabilidade: Testar diferentes cenários
- Deployments: Features podem ser toggleadas sem code change
- Código limpo: Sem comentários baguncados

## 💡 Padrões de Uso

### HTTP Service

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

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  // Ou melhor ainda:
  getUsers(): Observable<User[]> {
    const url = this.config.buildEndpointUrl(API_ENDPOINTS.USERS.BASE);
    return this.http.get<User[]>(url);
  }
}
```

### Storage Service

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(private config: ConfigService) {}

  set(key: string, value: any): void {
    const prefixedKey = this.config.getStorageKey(key);
    
    const storageType = this.config.getStorageType();
    if (storageType === 'localStorage') {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    } else {
      // indexedDB implementation
    }
  }

  get<T>(key: string): T | null {
    const prefixedKey = this.config.getStorageKey(key);
    const item = localStorage.getItem(prefixedKey);
    return item ? JSON.parse(item) : null;
  }
}
```

### Auth Service

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey: string;
  private refreshTokenKey: string;

  constructor(
    private config: ConfigService,
    private storage: StorageService
  ) {
    this.tokenKey = STORAGE_KEYS.TOKEN;
    this.refreshTokenKey = STORAGE_KEYS.REFRESH_TOKEN;
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    const url = this.config.buildEndpointUrl(API_ENDPOINTS.AUTH.LOGIN);
    
    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(response => {
        this.storage.set(this.tokenKey, response.token);
        this.storage.set(this.refreshTokenKey, response.refreshToken);
      })
    );
  }

  getToken(): string | null {
    return this.storage.get(this.tokenKey);
  }
}
```

### Logging Service

```typescript
@Injectable({ providedIn: 'root' })
export class LoggerService {
  constructor(private config: ConfigService) {}

  debug(message: string, data?: any): void {
    if (!this.config.isConsoleLoggingEnabled()) return;
    if (this.config.getLogLevel() !== 'debug') return;
    
    console.debug(`[DEBUG] ${message}`, data);
    
    if (this.config.isRemoteLoggingEnabled()) {
      this.sendToRemote('debug', message, data);
    }
  }

  error(message: string, error?: any): void {
    if (this.config.isConsoleLoggingEnabled()) {
      console.error(`[ERROR] ${message}`, error);
    }
    
    if (this.config.isRemoteLoggingEnabled()) {
      this.sendToRemote('error', message, error);
    }
  }

  private sendToRemote(level: string, message: string, data?: any): void {
    // Send to remote logging service
  }
}
```

## 🧪 Testes

### Mockar ConfigService

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    // Create mock
    mockConfigService = jasmine.createSpyObj('ConfigService', [
      'getApiUrl',
      'isDebugModeEnabled',
      'getStorageKey',
      'buildEndpointUrl'
    ]);

    // Configure mock
    mockConfigService.getApiUrl.and.returnValue('http://test.com/api/v1');
    mockConfigService.isDebugModeEnabled.and.returnValue(true);
    mockConfigService.getStorageKey.and.callFake(key => `test_${key}`);

    TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [
        { provide: ConfigService, useValue: mockConfigService }
      ]
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should use config service', () => {
    component.ngOnInit();
    expect(mockConfigService.getApiUrl).toHaveBeenCalled();
  });
});
```

### Testar Diferentes Ambientes

```typescript
describe('ApiService', () => {
  it('should use development URL in dev', () => {
    const devConfig = {
      getApiUrl: () => 'http://localhost:3000/api/v1'
    };
    
    const service = new ApiService(http, devConfig as any);
    // Test with dev URL
  });

  it('should use production URL in prod', () => {
    const prodConfig = {
      getApiUrl: () => 'https://api.barberboss.com/api/v1'
    };
    
    const service = new ApiService(http, prodConfig as any);
    // Test with prod URL
  });
});
```

## 🔒 Segurança

### 1. Não Hardcode Credenciais

❌ **NUNCA faça:**
```typescript
const API_KEY = 'abc123xyz';
const SECRET = 'my-secret-key';
```

✅ **Faça:**
```typescript
// Em environment.ts (não comitar!)
apiKey: process.env['API_KEY'] || '',

// Ou use o config service
const apiKey = this.config.get('api.apiKey');
```

### 2. Proteja Dados Sensíveis em Logs

```typescript
debug(message: string, data: any): void {
  if (!this.config.isDebugModeEnabled()) return;
  
  // Remove dados sensíveis
  const sanitized = this.sanitize(data);
  console.log(message, sanitized);
}

private sanitize(data: any): any {
  const sensitive = ['password', 'token', 'creditCard', 'ssn'];
  const sanitized = { ...data };
  
  for (const key of sensitive) {
    if (sanitized[key]) {
      sanitized[key] = '***REDACTED***';
    }
  }
  
  return sanitized;
}
```

### 3. Valide URLs em Produção

```typescript
ngOnInit() {
  if (this.config.isProduction()) {
    const apiUrl = this.config.getApiBaseUrl();
    
    if (!apiUrl.startsWith('https://')) {
      console.error('⚠️ Production must use HTTPS!');
    }
  }
}
```

## ⚡ Performance

### 1. Cache Valores Usados Frequentemente

```typescript
@Injectable({ providedIn: 'root' })
export class CachedConfigService {
  private apiUrl: string;
  private storagePrefix: string;

  constructor(private config: ConfigService) {
    // Cache valores que não mudam
    this.apiUrl = this.config.getApiUrl();
    this.storagePrefix = this.config.getStoragePrefix();
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
```

### 2. Lazy Load Features Opcionais

```typescript
async loadAnalytics(): Promise<void> {
  if (!this.config.isAnalyticsEnabled()) {
    return;
  }

  // Lazy load analytics module
  const { AnalyticsModule } = await import('./analytics/analytics.module');
  // Initialize analytics
}
```

## 📱 Mobile-Specific

### 1. Detectar Conectividade

```typescript
@Injectable({ providedIn: 'root' })
export class NetworkService {
  constructor(private config: ConfigService) {}

  isOnline(): boolean {
    return navigator.onLine;
  }

  canUseOfflineMode(): boolean {
    return this.config.isOfflineModeEnabled() && !this.isOnline();
  }
}
```

### 2. Adaptar por Plataforma

```typescript
import { Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class PlatformConfigService {
  constructor(
    private config: ConfigService,
    private platform: Platform
  ) {}

  getStorageStrategy(): 'localStorage' | 'indexedDB' {
    // No mobile, sempre use indexedDB se disponível
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      return 'indexedDB';
    }
    
    return this.config.getStorageType();
  }
}
```

## 🎨 UI/UX

### 1. Respeitar Preferências de Tema

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private config: ConfigService) {}

  initialize(): void {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || this.config.getDefaultTheme();
    
    this.applyTheme(theme);
  }

  applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      theme = prefersDark.matches ? 'dark' : 'light';
    }
    
    document.body.classList.toggle('dark', theme === 'dark');
  }
}
```

### 2. Animações Condicionais

```typescript
@Component({
  selector: 'app-list',
  animations: [fadeIn, slideIn]
})
export class ListComponent {
  enableAnimations: boolean;

  constructor(private config: ConfigService) {
    this.enableAnimations = this.config.areAnimationsEnabled();
  }

  getAnimationState(): string {
    return this.enableAnimations ? 'enter' : 'none';
  }
}
```

## 📊 Monitoramento

### 1. Track Configuration Usage

```typescript
@Injectable({ providedIn: 'root' })
export class ConfigMonitorService {
  constructor(
    private config: ConfigService,
    private analytics: AnalyticsService
  ) {}

  trackConfigUsage(): void {
    if (!this.config.isAnalyticsEnabled()) return;

    this.analytics.track('config_loaded', {
      environment: this.config.isProduction() ? 'prod' : 'dev',
      features: {
        debug: this.config.isDebugModeEnabled(),
        analytics: this.config.isAnalyticsEnabled(),
        offline: this.config.isOfflineModeEnabled(),
      }
    });
  }
}
```

## 🔄 Migrations

### Migrando Código Legado

**Antes:**
```typescript
import { environment } from '../environments/environment';

const apiUrl = environment.apiUrl;
localStorage.setItem('token', token);

if (environment.production) {
  // production code
}
```

**Depois:**
```typescript
import { ConfigService } from './core/services';
import { STORAGE_KEYS } from './core/constants';

constructor(private config: ConfigService) {}

const apiUrl = this.config.getApiUrl();
const tokenKey = this.config.getStorageKey(STORAGE_KEYS.TOKEN);
localStorage.setItem(tokenKey, token);

if (this.config.isProduction()) {
  // production code
}
```

## ✅ Checklist de Code Review

Ao revisar código, verifique:

- [ ] Usa ConfigService ao invés de import direto de environment
- [ ] Usa constantes ao invés de strings mágicas
- [ ] Feature flags para código condicional
- [ ] Storage keys são prefixadas
- [ ] URLs são construídas com buildEndpointUrl()
- [ ] Logs respeitam configuração de logging
- [ ] Dados sensíveis não são logados
- [ ] Configurações são mockadas em testes
- [ ] HTTPS usado em produção
- [ ] Valores não são hardcoded

## 🎓 Treinamento

### Para Novos Desenvolvedores

1. **Dia 1:** Ler Quick Start Guide
2. **Dia 2:** Explorar ConfigService e constantes
3. **Dia 3:** Implementar feature usando configuração
4. **Dia 4:** Escrever testes com mocks
5. **Dia 5:** Code review com mentor

### Workshops Sugeridos

- **Workshop 1:** Introdução ao ConfigService (1h)
- **Workshop 2:** Feature Flags na Prática (1h)
- **Workshop 3:** Testando com Mocks (1h)
- **Workshop 4:** Segurança e Best Practices (1h)

## 📚 Recursos Adicionais

- **Quick Start:** Para começar rapidamente
- **Full Docs:** Para referência completa
- **Quick Reference:** Para uso diário
- **Examples:** Para aprender com código
- **Tests:** Para ver padrões de teste

## 🆘 Problemas Comuns

### "ConfigService is not defined"
**Solução:** Importar corretamente
```typescript
import { ConfigService } from './core/services';
```

### "Configuration not loading"
**Solução:** Verificar providedIn
```typescript
@Injectable({ providedIn: 'root' })
```

### "Wrong environment used"
**Solução:** Verificar angular.json file replacements

### "Type errors"
**Solução:** Usar interface Environment
```typescript
import { Environment } from './environment.interface';
```

---

## 🎯 Resumo

1. **Use ConfigService sempre**
2. **Use constantes, não strings**
3. **Use feature flags**
4. **Prefixe storage keys**
5. **Mock em testes**
6. **Proteja dados sensíveis**
7. **Cache valores frequentes**
8. **Adapte por plataforma**
9. **Monitore uso**
10. **Revise código sistematicamente**

---

**Última Atualização:** 10/12/2025  
**Versão:** 1.0.0

Seguindo estas práticas, você terá uma aplicação mais segura, testável e manutenível! 🚀
