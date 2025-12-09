# BarberBoss - Documentação

## 📋 Visão Geral

BarberBoss é um sistema de agendamento para barbearias construído com NestJS e Ionic, suportando três tipos de usuários: **ADMIN**, **BARBER** e **CLIENT**.

## 📚 Estrutura da Documentação

### 🖥️ [Backend](./backend/README.md)

Documentação da API e arquitetura do servidor.

- [Autenticação](./backend/AUTH.md) - Sistema de autenticação JWT e autorização por roles
- [Paginação](./backend/PAGINATION.md) - Implementação de paginação nos endpoints
- [Exemplos de Paginação](./backend/PAGINATION_EXAMPLES.md) - Exemplos práticos de uso da API
- [Day.js](./backend/DAYJS.md) - Configuração e uso do Day.js com timezone PT-BR

### 📱 [Mobile](./mobile/README.md)

Documentação do aplicativo mobile.

- Configuração e setup
- Estrutura de páginas
- Build para Android/iOS

### 🎨 [Design](./design/README.md)

Guia de estilização e design system.

- Paleta de cores
- Tipografia
- Componentes
- Acessibilidade

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
