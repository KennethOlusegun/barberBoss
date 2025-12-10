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

## Localização

```
mobile/src/app/core/services/storage/
├── storage.service.ts
├── storage.service.spec.ts
└── README.md
```

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

Para mais exemplos detalhados de uso, consulte a documentação completa no arquivo `README.md` dentro do diretório do serviço.

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

## Referências

- [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences)
- [Angular Services](https://angular.io/guide/architecture-services)
- Documentação completa: `mobile/src/app/core/services/storage/README.md`
