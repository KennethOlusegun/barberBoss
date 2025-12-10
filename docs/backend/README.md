# Backend - BarberBoss

## 📋 Visão Geral

API RESTful construída com NestJS, Prisma ORM e PostgreSQL para gerenciamento de barbearias.

## 🏗️ Arquitetura

### Tecnologias

- **NestJS** - Framework Node.js
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Day.js** - Manipulação de datas
- **Swagger** - Documentação da API

### Módulos Principais

- **Auth** - Autenticação e autorização
- **User** - Gerenciamento de usuários
- **Service** - Serviços da barbearia
- **Appointment** - Sistema de agendamentos

## 📚 Documentação

- [Autenticação](./AUTH.md) - Sistema de autenticação JWT e autorização por roles
- [Paginação](./PAGINATION.md) - Implementação de paginação nos endpoints
- [Exemplos de Paginação](./PAGINATION_EXAMPLES.md) - Exemplos práticos de uso da API
- [Day.js](./DAYJS.md) - Configuração e uso do Day.js com timezone PT-BR

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

```bash
cd backend
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do backend:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/barberboss"
JWT_SECRET="sua_chave_secreta_aqui"
```

### Migrations

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Abrir Prisma Studio
npx prisma studio
```

### Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📖 Documentação da API

Após iniciar o servidor, acesse:

```
http://localhost:3000/api
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 🔐 Autenticação

Todas as rotas (exceto `/auth/login` e `/auth/register`) requerem autenticação JWT.

**Header necessário:**
```
Authorization: Bearer <seu_token_jwt>
```

## 👥 Roles de Usuário

- **ADMIN** - Acesso total ao sistema
- **BARBER** - Gerenciar agendamentos e serviços
- **CLIENT** - Visualizar e criar agendamentos

## 🌍 Timezone

O sistema está configurado para usar o timezone `America/Sao_Paulo` (UTC-3).
