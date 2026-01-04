# Mobile - BarberBoss

## 📋 Visão Geral

Aplicativo mobile híbrido construído com Ionic e Angular para clientes e barbeiros.

## 🏗️ Arquitetura

### Tecnologias

- **Ionic** - Framework mobile híbrido
- **Angular** - Framework frontend
- **Capacitor** - Runtime nativo
- **TypeScript** - Linguagem de programação

## 📚 Documentação

### Configuração e Setup

- [Environment Configuration](./ENVIRONMENT_CONFIGURATION.md) - Configuração de ambientes
- [Environment Complete Guide](./ENVIRONMENT_COMPLETE.md) - Guia completo de variáveis
- [Environment Quickstart](./ENVIRONMENT_QUICKSTART.md) - Início rápido
- [Environment Best Practices](./ENVIRONMENT_BEST_PRACTICES.md) - Melhores práticas
- [Environment Checklist](./ENVIRONMENT_CHECKLIST.md) - Checklist de configuração
- [Environment Quick Reference](./ENVIRONMENT_QUICK_REFERENCE.md) - Referência rápida
- [Environment Testing Examples](./ENVIRONMENT_TESTING_EXAMPLES.md) - Exemplos de teste
- [Environment Implementation Summary](./ENVIRONMENT_IMPLEMENTATION_SUMMARY.md) - Resumo da implementação

### Serviços Core

- [API Service](./API_SERVICE.md) - Serviço HTTP de comunicação com backend
- [API Implementation Summary](./API_IMPLEMENTATION_SUMMARY.md) - Resumo da implementação da API
- [Storage Service](./STORAGE_SERVICE.md) - Serviço de armazenamento local
- [Auth Service](./AUTH_SERVICE.md) - Serviço de autenticação

### HTTP e Interceptors

- [HTTP Interceptors](./HTTP_INTERCEPTORS.md) - Sistema completo de interceptors
- [HTTP Interceptors Changelog](./HTTP_INTERCEPTORS_CHANGELOG.md) - Histórico de mudanças
- [Auth Interceptor Setup](./AUTH_INTERCEPTOR_SETUP.md) - Configuração do interceptor de auth

### Models e Interfaces

- [Models & Interfaces](./MODELS_INTERFACES.md) - Documentação completa de models
- [Models Implementation](./MODELS_IMPLEMENTATION.md) - Resumo da implementação

### Exemplos

- [Examples](./EXAMPLES.md) - Componentes de exemplo e demos

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

Configure as variáveis de ambiente em `src/environments/`:

**environment.ts** (Desenvolvimento)

```typescript
export const environment = {
  production: false,
  api: {
    baseUrl: "http://localhost:3000",
    timeout: 30000,
  },
};
```

**environment.prod.ts** (Produção)

```typescript
export const environment = {
  production: true,
  api: {
    baseUrl: "https://api.barberboss.com",
    timeout: 30000,
  },
};
```

Para configuração completa, veja [Environment Configuration](./ENVIRONMENT_CONFIGURATION.md).

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

O app usa autenticação JWT com refresh token automático. Veja:

- [Auth Service](./AUTH_SERVICE.md) - Implementação do serviço de auth
- [Auth Interceptor](./AUTH_INTERCEPTOR_SETUP.md) - Configuração do interceptor

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run e2e
```

## 📖 Recursos Adicionais

- [Design System](../design/README.md) - Guia de estilização
- [Backend API](../backend/README.md) - Documentação da API


## 🛠️ Troubleshooting - Build APK

### Requisitos de Sistema
- **RAM:** 4GB+ (recomendado 8GB)
- **Espaço em disco:** 5GB+ livre
- **Java:** versão 11 ou 17
- **Android Studio** instalado

### Problema Comum: Build trava em 82%
Esse erro geralmente está relacionado à falta de memória para o Gradle ou processos travados.

### Soluções Rápidas
```bash
# Corrigir memória do Gradle e matar processos travados
./scripts/fix-gradle-memory.sh

# Validar ambiente de build
./scripts/validate-build-setup.sh

# Diagnosticar problemas detalhados
./scripts/debug-build.sh

# Build otimizado
./scripts/build-apk.sh
```

### Como aumentar memória do Gradle
Verifique se estes parâmetros estão em `android/gradle.properties` e `~/.gradle/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.configureondemand=true
org.gradle.caching=true
org.gradle.parallel=true
```

### Como limpar cache do Gradle
```bash
rm -rf ~/.gradle/caches
```

### Como verificar logs detalhados
```bash
./android/gradlew :app:assembleRelease --info --stacktrace
```

### Quando usar EAS Build
Se seu PC não tem memória suficiente ou o build local falha repetidamente, use [EAS Build](https://docs.expo.dev/build/introduction/).

### Links úteis
- [Documentação oficial Gradle](https://docs.gradle.org/current/userguide/build_environment.html)
- [Expo Build Troubleshooting](https://docs.expo.dev/build-reference/troubleshooting/)
- [React Native Build Docs](https://reactnative.dev/docs/signed-apk-android)

### Comandos úteis de debug
```bash
# Verificar status dos daemons
./android/gradlew --status
# Parar todos os daemons
./android/gradlew --stop
# Limpar build
./android/gradlew clean
# Build detalhado
./android/gradlew :app:assembleRelease --info --stacktrace
```

> 💡 **Dica:** Use os scripts em `scripts/` para automatizar correções e diagnósticos.
