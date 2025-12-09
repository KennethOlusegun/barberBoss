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

Para informações sobre design e estilização, consulte a [documentação de design](../design/README.md).
