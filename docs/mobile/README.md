# Mobile - BarberBoss

## 📋 Visão Geral

Aplicativo mobile híbrido construído com Ionic e Angular para clientes e barbeiros.

## 🏗️ Arquitetura

### Tecnologias

- **Ionic** - Framework mobile híbrido
- **Angular** - Framework frontend
- **Capacitor** - Runtime nativo
- **TypeScript** - Linguagem de programação

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- Ionic CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Instalação

```bash
cd mobile
npm install
```

### Configuração

#### Environment Configuration (Recomendado)

O projeto utiliza um sistema robusto de configuração de ambiente. Para começar rapidamente:

1. **Leia o Quick Start:**
   ```bash
   cat docs/mobile/ENVIRONMENT_QUICKSTART.md
   ```

2. **Revise os arquivos de ambiente:**
   - `src/environments/environment.ts` (Desenvolvimento)
   - `src/environments/environment.prod.ts` (Produção)

3. **Use o ConfigService:**
   ```typescript
   import { ConfigService } from './core/services';
   
   constructor(private config: ConfigService) {}
   
   const apiUrl = this.config.getApiUrl();
   ```

4. **Documentação completa:**
   - 📘 [Environment Configuration](./ENVIRONMENT_CONFIGURATION.md)
   - 🚀 [Quick Start Guide](./ENVIRONMENT_QUICKSTART.md)

#### Configuração Básica (Legado)

Configure as variáveis de ambiente em `src/environments/`:

**environment.ts** (Desenvolvimento)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

**environment.prod.ts** (Produção)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.barberboss.com'
};
```

### Executar

```bash
# Servidor de desenvolvimento
ionic serve

# Abrir no navegador
ionic serve --lab

# Android
ionic cap run android

# iOS
ionic cap run ios
```

## 📱 Build

### Web

```bash
# Build de produção
npm run build

# Preview do build
npx http-server www
```

### Android

```bash
# Sincronizar com Capacitor
ionic cap sync android

# Abrir no Android Studio
ionic cap open android

# Build APK
cd android
./gradlew assembleDebug
```

### iOS

```bash
# Sincronizar com Capacitor
ionic cap sync ios

# Abrir no Xcode
ionic cap open ios
```

## 🎨 Estrutura de Páginas

- **Tab1** - Home/Dashboard
- **Tab2** - Agendamentos
- **Tab3** - Perfil

## 🔐 Autenticação

O app armazena o token JWT no Local Storage após login bem-sucedido.

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run e2e
```

## 📚 Documentação Adicional

### Environment Configuration (Novo!)

**Comece aqui:**
- 🚀 **[Quick Start](./ENVIRONMENT_QUICKSTART.md)** - Guia de início rápido (5 min)

**Para desenvolvimento:**
- 🔍 **[Referência Rápida](./ENVIRONMENT_QUICK_REFERENCE.md)** - Para uso diário
- ⭐ **[Best Practices](./ENVIRONMENT_BEST_PRACTICES.md)** - Boas práticas recomendadas
- 🧪 **[Testing Examples](./ENVIRONMENT_TESTING_EXAMPLES.md)** - Exemplos de testes

**Documentação completa:**
- 📘 **[Documentação Completa](./ENVIRONMENT_CONFIGURATION.md)** - Guia detalhado
- 📋 **[Checklist](./ENVIRONMENT_CHECKLIST.md)** - Lista de verificação
- 📊 **[Sumário](./ENVIRONMENT_IMPLEMENTATION_SUMMARY.md)** - Visão geral da implementação

### Design
Para informações sobre design e estilização, consulte a [documentação de design](../design/README.md).
