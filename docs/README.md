# 🛠️ Troubleshooting - Build APK

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
# BarberBoss - Documentação

## 📋 Visão Geral

BarberBoss é um sistema de agendamento para barbearias construído com NestJS e Ionic, suportando três tipos de usuários: **ADMIN**, **BARBER** e **CLIENT**.

## 📚 Estrutura da Documentação

### 🖥️ [Backend](./backend/README.md)

Documentação da API e arquitetura do servidor.

**Autenticação e Segurança:**

- [Autenticação](./backend/AUTH.md) - Sistema de autenticação JWT e autorização por roles
- [Rate Limiting](./backend/RATE_LIMITING.md) - Controle de taxa de requisições
- [Exception Filters](./backend/EXCEPTION_FILTERS.md) - Tratamento global de exceções
- [Environment Validation](./backend/ENV_VALIDATION.md) - Validação de variáveis de ambiente

**APIs e Endpoints:**

- [Paginação](./backend/PAGINATION.md) - Implementação de paginação nos endpoints
- [Exemplos de Paginação](./backend/PAGINATION_EXAMPLES.md) - Exemplos práticos de uso da API
- [Time Blocks](./backend/TIME_BLOCKS.md) - Sistema de bloqueios de horário
- [Time Blocks Payloads](./backend/TIME_BLOCKS_PAYLOADS.md) - Exemplos de payloads
- [Available Slots](./backend/AVAILABLE_SLOTS.md) - Horários disponíveis
- [Business Hours](./backend/BUSINESS_HOURS.md) - Horários de funcionamento
- [Client History](./backend/CLIENT_HISTORY.md) - Histórico de clientes
- [Client History Examples](./backend/CLIENT_HISTORY_EXAMPLES.md) - Exemplos de uso
- [Settings](./backend/SETTINGS.md) - Configurações do sistema

**Ferramentas e Utilidades:**

- [Day.js](./backend/DAYJS.md) - Configuração e uso do Day.js com timezone PT-BR
- [Complete Flow](./backend/COMPLETE_FLOW.md) - Fluxo completo da aplicação

### 📱 [Mobile](./mobile/README.md)

Documentação do aplicativo mobile.

**Configuração:**

- [Environment Configuration](./mobile/ENVIRONMENT_CONFIGURATION.md) - Configuração de ambientes
- [Environment Complete](./mobile/ENVIRONMENT_COMPLETE.md) - Guia completo
- [Environment Quickstart](./mobile/ENVIRONMENT_QUICKSTART.md) - Início rápido
- [Environment Best Practices](./mobile/ENVIRONMENT_BEST_PRACTICES.md) - Melhores práticas

**Serviços Core:**

- [API Service](./mobile/API_SERVICE.md) - Serviço HTTP de comunicação
- [Storage Service](./mobile/STORAGE_SERVICE.md) - Armazenamento local
- [Auth Service](./mobile/AUTH_SERVICE.md) - Autenticação

**HTTP e Interceptors:**

- [HTTP Interceptors](./mobile/HTTP_INTERCEPTORS.md) - Sistema completo de interceptors
- [Auth Interceptor Setup](./mobile/AUTH_INTERCEPTOR_SETUP.md) - Configuração de auth

**Models e Interfaces:**

- [Models & Interfaces](./mobile/MODELS_INTERFACES.md) - Documentação completa
- [Models Implementation](./mobile/MODELS_IMPLEMENTATION.md) - Resumo da implementação

### 🎨 [Design](./design/README.md)

Guia de estilização e design system.

- Paleta de cores
- Tipografia e hierarquia
- Componentes (botões, cards, inputs)
- Espaçamento e bordas
- Responsividade
- Acessibilidade (WCAG)
- Animações e transições
- Temas (claro/escuro)

## 🏗️ Arquitetura do Projeto

### Backend (NestJS)

API RESTful construída com NestJS, Prisma ORM e PostgreSQL.

**Principais Módulos:**

- **Auth** - Autenticação JWT
- **User** - Gerenciamento de usuários
- **Service** - Serviços da barbearia
- **Appointment** - Sistema de agendamentos

### Mobile (Ionic/Angular)

Aplicativo mobile híbrido construído com Ionic e Angular.

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <repo-url>

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Mobile
cd mobile
npm install
```

### Executar com Docker

```bash
# Iniciar todos os serviços
docker-compose up

# Ou em modo debug
docker-compose -f compose.debug.yaml up
```

## 📖 Documentação da API

Após iniciar o backend, acesse a documentação Swagger:

```
http://localhost:3000/api
```

## 🔐 Autenticação

O sistema usa JWT para autenticação. Veja mais detalhes em [AUTH.md](./AUTH.md).

## 📝 Licença

Este projeto está sob a licença MIT.
