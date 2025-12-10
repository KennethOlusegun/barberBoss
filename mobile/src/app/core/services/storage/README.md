# Storage Service

Serviço robusto de armazenamento local para o aplicativo mobile, construído sobre o Capacitor Preferences API.

## Características

- ✅ **Type-safe**: Totalmente tipado com TypeScript
- ⏰ **TTL Support**: Expiração automática de dados
- 🔄 **Auto Serialization**: JSON serialization/deserialization automático
- 📊 **Storage Stats**: Estatísticas e gerenciamento de armazenamento
- 🔄 **Migrations**: Suporte para migrações de schema
- 🧹 **Auto Cleanup**: Limpeza automática de itens expirados
- 🎯 **Prefix Operations**: Operações em lote por prefixo

## Instalação

O serviço já está configurado e pronto para uso. A dependência `@capacitor/preferences` foi instalada.

## Uso Básico

### Importação

```typescript
import { StorageService, StorageKey } from '@core/services';
```

### Injeção no Componente/Serviço

```typescript
import { Component } from '@angular/core';
import { StorageService } from '@core/services';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent {
  constructor(private storage: StorageService) {}
}
```

### Inicialização

É recomendado inicializar o serviço no `app.component.ts`:

```typescript
async ngOnInit() {
  try {
    await this.storage.initialize();
    console.log('Storage initialized');
  } catch (error) {
    console.error('Storage initialization failed:', error);
  }
}
```

## Exemplos de Uso

### 1. Armazenar Dados Simples

```typescript
// Armazenar string
await this.storage.set('username', 'john_doe');

// Armazenar número
await this.storage.set('user_age', 25);

// Armazenar booleano
await this.storage.set('is_premium', true);
```

### 2. Armazenar Objetos Complexos

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
};

await this.storage.set<User>('current_user', user);
```

### 3. Usar StorageKey Enum

```typescript
import { StorageKey } from '@core/services';

// Armazenar token de autenticação
await this.storage.set(StorageKey.ACCESS_TOKEN, 'token123');

// Armazenar dados do usuário
await this.storage.set(StorageKey.USER_DATA, userData);

// Armazenar preferência de tema
await this.storage.set(StorageKey.THEME, 'dark');
```

### 4. Recuperar Dados

```typescript
// Recuperar string
const username = await this.storage.get<string>('username');
console.log(username); // 'john_doe'

// Recuperar objeto
const user = await this.storage.get<User>('current_user');
if (user) {
  console.log(user.name); // 'John Doe'
}

// Recuperar com tipo inferido
const token = await this.storage.get<string>(StorageKey.ACCESS_TOKEN);
```

### 5. Dados com Expiração (TTL)

```typescript
// Armazenar por 1 hora (3600000 ms)
await this.storage.set('session_data', sessionData, { 
  ttl: 3600000 
});

// Armazenar por 24 horas
await this.storage.set('cached_data', data, { 
  ttl: 24 * 60 * 60 * 1000 
});

// Verificar se expirou
const isExpired = await this.storage.isExpired('session_data');

// Renovar TTL
await this.storage.refreshTTL('session_data', 3600000);
```

### 6. Verificar Existência

```typescript
const hasToken = await this.storage.has(StorageKey.ACCESS_TOKEN);

if (hasToken) {
  const token = await this.storage.get<string>(StorageKey.ACCESS_TOKEN);
  // Use o token
}
```

### 7. Remover Dados

```typescript
// Remover item específico
await this.storage.remove('username');

// Remover usando enum
await this.storage.remove(StorageKey.ACCESS_TOKEN);
```

### 8. Limpar Cache

```typescript
// Limpar todos os itens de cache
await this.storage.removeByPrefix(StorageKey.CACHE_PREFIX);

// Limpar itens específicos
await this.storage.removeByPrefix('user.');
```

### 9. Limpar Todo o Storage

```typescript
// ⚠️ Cuidado! Remove todos os dados
await this.storage.clear();
```

### 10. Estatísticas de Storage

```typescript
const stats = await this.storage.getStats();

console.log('Total de itens:', stats.itemCount);
console.log('Tamanho estimado:', stats.estimatedSize, 'bytes');
console.log('Chaves:', stats.keys);
```

### 11. Listar Todas as Chaves

```typescript
const allKeys = await this.storage.keys();
console.log('Chaves armazenadas:', allKeys);
```

### 12. Dados Raw (com Metadata)

```typescript
const rawData = await this.storage.getRaw('session_data');

if (rawData) {
  console.log('Valor:', rawData.value);
  console.log('Armazenado em:', new Date(rawData.timestamp));
  console.log('Expira em:', rawData.expiresAt 
    ? new Date(rawData.expiresAt) 
    : 'Nunca'
  );
}
```

## Exemplos Práticos

### Gerenciar Autenticação

```typescript
export class AuthService {
  constructor(private storage: StorageService) {}

  async login(credentials: LoginCredentials): Promise<void> {
    const response = await this.api.login(credentials);
    
    // Salvar tokens com expiração de 7 dias
    await this.storage.set(
      StorageKey.ACCESS_TOKEN, 
      response.accessToken,
      { ttl: 7 * 24 * 60 * 60 * 1000 }
    );
    
    await this.storage.set(
      StorageKey.REFRESH_TOKEN,
      response.refreshToken
    );
    
    // Salvar dados do usuário
    await this.storage.set(StorageKey.USER_DATA, response.user);
  }

  async logout(): Promise<void> {
    // Remover dados de autenticação
    await this.storage.remove(StorageKey.ACCESS_TOKEN);
    await this.storage.remove(StorageKey.REFRESH_TOKEN);
    await this.storage.remove(StorageKey.USER_DATA);
  }

  async getToken(): Promise<string | null> {
    return this.storage.get<string>(StorageKey.ACCESS_TOKEN);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }
}
```

### Sistema de Cache

```typescript
export class CacheService {
  constructor(private storage: StorageService) {}

  async cacheData<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    const cacheKey = `${StorageKey.CACHE_PREFIX}${key}`;
    await this.storage.set(cacheKey, data, { ttl });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cacheKey = `${StorageKey.CACHE_PREFIX}${key}`;
    return this.storage.get<T>(cacheKey);
  }

  async clearCache(): Promise<void> {
    await this.storage.removeByPrefix(StorageKey.CACHE_PREFIX);
  }
}
```

### Preferências do Usuário

```typescript
export class PreferencesService {
  constructor(private storage: StorageService) {}

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await this.storage.set(StorageKey.THEME, theme);
  }

  async getTheme(): Promise<'light' | 'dark'> {
    return await this.storage.get<'light' | 'dark'>(StorageKey.THEME) || 'light';
  }

  async setLanguage(language: string): Promise<void> {
    await this.storage.set(StorageKey.LANGUAGE, language);
  }

  async getLanguage(): Promise<string> {
    return await this.storage.get<string>(StorageKey.LANGUAGE) || 'pt-BR';
  }

  async toggleNotifications(enabled: boolean): Promise<void> {
    await this.storage.set(StorageKey.NOTIFICATIONS_ENABLED, enabled);
  }

  async areNotificationsEnabled(): Promise<boolean> {
    return await this.storage.get<boolean>(StorageKey.NOTIFICATIONS_ENABLED) ?? true;
  }
}
```

### Onboarding

```typescript
export class OnboardingService {
  constructor(private storage: StorageService) {}

  async completeOnboarding(): Promise<void> {
    await this.storage.set(StorageKey.ONBOARDING_COMPLETED, true);
  }

  async hasCompletedOnboarding(): Promise<boolean> {
    return await this.storage.get<boolean>(StorageKey.ONBOARDING_COMPLETED) ?? false;
  }

  async resetOnboarding(): Promise<void> {
    await this.storage.remove(StorageKey.ONBOARDING_COMPLETED);
  }
}
```

## StorageKey Enum

As chaves predefinidas disponíveis:

```typescript
export enum StorageKey {
  // Autenticação
  ACCESS_TOKEN = 'auth.access_token',
  REFRESH_TOKEN = 'auth.refresh_token',
  USER_DATA = 'auth.user_data',
  
  // Preferências do Usuário
  THEME = 'preferences.theme',
  LANGUAGE = 'preferences.language',
  NOTIFICATIONS_ENABLED = 'preferences.notifications_enabled',
  
  // Estado da Aplicação
  ONBOARDING_COMPLETED = 'app.onboarding_completed',
  LAST_SYNC = 'app.last_sync',
  
  // Cache
  CACHE_PREFIX = 'cache.',
}
```

## Migrações

Para adicionar migrações de storage:

```typescript
// No construtor ou método de inicialização
this.storage.registerMigration({
  version: 2,
  migrate: async () => {
    // Exemplo: Migrar dados antigos para novo formato
    const oldData = await this.storage.get('old_key');
    if (oldData) {
      await this.storage.set('new_key', transformData(oldData));
      await this.storage.remove('old_key');
    }
  }
});
```

## Boas Práticas

1. **Use o enum StorageKey** para chaves comuns
2. **Sempre use tipagem** ao recuperar dados
3. **Configure TTL** para dados temporários
4. **Inicialize o serviço** no início do app
5. **Limpe cache periodicamente** para economizar espaço
6. **Use prefixos** para organizar dados relacionados
7. **Trate erros** adequadamente
8. **Não armazene dados sensíveis** sem criptografia

## Testes

Execute os testes com:

```bash
npm test -- storage.service.spec.ts
```

## API Reference

### Métodos Principais

| Método | Descrição |
|--------|-----------|
| `set(key, value, options?)` | Armazena dados |
| `get<T>(key)` | Recupera dados |
| `remove(key)` | Remove dados |
| `clear()` | Limpa todo o storage |
| `has(key)` | Verifica existência |
| `keys()` | Lista todas as chaves |
| `getStats()` | Retorna estatísticas |
| `removeByPrefix(prefix)` | Remove por prefixo |
| `isExpired(key)` | Verifica expiração |
| `refreshTTL(key, ttl)` | Renova TTL |
| `getRaw(key)` | Obtém dados com metadata |
| `initialize()` | Inicializa o serviço |

## Troubleshooting

### Dados não estão sendo salvos

Verifique se o serviço foi inicializado:

```typescript
await this.storage.initialize();
```

### Dados desaparecem

Verifique se você não está usando TTL muito curto ou se há limpeza automática ativa.

### Performance lenta

Considere:
- Limpar itens não utilizados
- Usar TTL para dados temporários
- Evitar armazenar objetos muito grandes

## Referências

- [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences)
- [Angular Services](https://angular.io/guide/architecture-services)
