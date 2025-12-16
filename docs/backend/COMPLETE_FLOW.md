# 🔄 Fluxo Completo de Testes - BarberBoss API

## 📋 Índice

1. [Criação de Usuários](#1-criação-de-usuários)
2. [Autenticação](#2-autenticação)
3. [Criação de Serviços](#3-criação-de-serviços)
4. [Configurações da Barbearia](#4-configurações-da-barbearia)
5. [Bloqueio de Horários](#5-bloqueio-de-horários)
6. [Agendamentos](#6-agendamentos)
7. [Consulta de Horários Disponíveis](#7-consulta-de-horários-disponíveis)

---

## 1. Criação de Usuários

### 1.1 Criar Usuário ADMIN

**POST** `/auth/register`

```json
{
  "name": "João Silva",
  "email": "admin@barberboss.com",
  "password": "Admin@123",
  "phone": "+5511999999999",
  "role": "ADMIN"
}
```

**Resposta Esperada (201):**

```json
{
  "id": "uuid-admin",
  "name": "João Silva",
  "email": "admin@barberboss.com",
  "phone": "+5511999999999",
  "role": "ADMIN",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

---

### 1.2 Criar Usuário BARBER

**POST** `/auth/register`

```json
{
  "name": "Carlos Barbeiro",
  "email": "barber@barberboss.com",
  "password": "Barber@123",
  "phone": "+5511988888888",
  "role": "BARBER"
}
```

---

### 1.3 Criar Usuário CLIENT

**POST** `/auth/register`

```json
{
  "name": "Maria Cliente",
  "email": "client@barberboss.com",
  "password": "Client@123",
  "phone": "+5511977777777",
  "role": "CLIENT"
}
```

---

## 2. Autenticação

### 2.1 Login como ADMIN

**POST** `/auth/login`

```json
{
  "email": "admin@barberboss.com",
  "password": "Admin@123"
}
```

**Resposta Esperada (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-admin",
    "name": "João Silva",
    "email": "admin@barberboss.com",
    "role": "ADMIN"
  }
}
```

**⚠️ Salve o `access_token` para usar nos próximos endpoints!**

---

### 2.2 Login como BARBER

**POST** `/auth/login`

```json
{
  "email": "barber@barberboss.com",
  "password": "Barber@123"
}
```

---

### 2.3 Login como CLIENT

**POST** `/auth/login`

```json
{
  "email": "client@barberboss.com",
  "password": "Client@123"
}
```

---

### 2.4 Verificar Usuário Autenticado

**GET** `/auth/me`

**Header:**

```
Authorization: Bearer {seu_token_jwt}
```

**Resposta (200):**

```json
{
  "id": "uuid-admin",
  "name": "João Silva",
  "email": "admin@barberboss.com",
  "role": "ADMIN",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

---

## 3. Criação de Serviços

### 3.1 Criar Serviço: Corte Simples

**POST** `/services` 🔒 _Requer token ADMIN_

```json
{
  "name": "Corte Simples",
  "description": "Corte de cabelo masculino tradicional",
  "price": 35.0,
  "durationMin": 30
}
```

**Resposta Esperada (201):**

```json
{
  "id": "uuid-servico-1",
  "name": "Corte Simples",
  "description": "Corte de cabelo masculino tradicional",
  "price": "35.00",
  "durationMin": 30,
  "active": true,
  "createdAt": "2025-01-10T10:05:00.000Z",
  "updatedAt": "2025-01-10T10:05:00.000Z"
}
```

**⚠️ Salve o `id` do serviço!**

---

### 3.2 Criar Serviço: Corte + Barba

**POST** `/services` 🔒 _Requer token ADMIN_

```json
{
  "name": "Corte + Barba",
  "description": "Corte de cabelo e barba completa",
  "price": 60.0,
  "durationMin": 45
}
```

---

### 3.3 Criar Serviço: Barba Completa

**POST** `/services` 🔒 _Requer token ADMIN_

```json
{
  "name": "Barba Completa",
  "description": "Barba aparada e finalizada",
  "price": 30.0,
  "durationMin": 20
}
```

---

### 3.4 Criar Serviço: Corte Degradê

**POST** `/services` 🔒 _Requer token ADMIN_

```json
{
  "name": "Corte Degradê",
  "description": "Corte degradê com desenho",
  "price": 50.0,
  "durationMin": 40
}
```

---

### 3.5 Listar Todos os Serviços

**GET** `/services` 🔓 _Público_

**Resposta (200):**

```json
{
  "data": [
    {
      "id": "uuid-servico-1",
      "name": "Corte Simples",
      "description": "Corte de cabelo masculino tradicional",
      "price": "35.00",
      "durationMin": 30,
      "active": true
    },
    {
      "id": "uuid-servico-2",
      "name": "Corte + Barba",
      "description": "Corte de cabelo e barba completa",
      "price": "60.00",
      "durationMin": 45,
      "active": true
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "lastPage": 1
  }
}
```

---

## 4. Configurações da Barbearia

### 4.1 Consultar Configurações

**GET** `/settings` 🔓 _Público_

**Resposta (200):**

```json
{
  "id": "uuid-config",
  "businessName": "Barber Boss",
  "openTime": "08:00",
  "closeTime": "18:00",
  "workingDays": [1, 2, 3, 4, 5, 6],
  "slotIntervalMin": 15,
  "maxAdvanceDays": 30,
  "minAdvanceHours": 2,
  "createdAt": "2025-01-10T08:00:00.000Z",
  "updatedAt": "2025-01-10T08:00:00.000Z"
}
```

---

### 4.2 Atualizar Configurações

**PATCH** `/settings` 🔒 _Requer token ADMIN_

```json
{
  "businessName": "Barbearia Barber Boss",
  "openTime": "09:00",
  "closeTime": "19:00",
  "workingDays": [1, 2, 3, 4, 5],
  "slotIntervalMin": 15,
  "maxAdvanceDays": 60,
  "minAdvanceHours": 1
}
```

**Resposta (200):**

```json
{
  "id": "uuid-config",
  "businessName": "Barbearia Barber Boss",
  "openTime": "09:00",
  "closeTime": "19:00",
  "workingDays": [1, 2, 3, 4, 5],
  "slotIntervalMin": 15,
  "maxAdvanceDays": 60,
  "minAdvanceHours": 1,
  "updatedAt": "2025-01-10T10:30:00.000Z"
}
```

---

## 5. Bloqueio de Horários

### 5.1 Criar Bloqueio: Almoço Diário

**POST** `/time-blocks` 🔒 _Requer token ADMIN_

```json
{
  "type": "LUNCH",
  "reason": "Horário de almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5]
}
```

**Resposta (201):**

```json
{
  "id": "uuid-bloqueio-1",
  "type": "LUNCH",
  "reason": "Horário de almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5],
  "active": true,
  "createdAt": "2025-01-10T10:35:00.000Z",
  "updatedAt": "2025-01-10T10:35:00.000Z"
}
```

---

### 5.2 Criar Bloqueio: Pausa para Café

**POST** `/time-blocks` 🔒 _Requer token ADMIN_

```json
{
  "type": "BREAK",
  "reason": "Pausa para café",
  "startsAt": "2025-01-10T15:00:00.000Z",
  "endsAt": "2025-01-10T15:15:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 3, 5]
}
```

---

### 5.3 Criar Bloqueio: Férias

**POST** `/time-blocks` 🔒 _Requer token ADMIN_

```json
{
  "type": "VACATION",
  "reason": "Férias de fim de ano",
  "startsAt": "2025-12-20T00:00:00.000Z",
  "endsAt": "2025-12-31T23:59:59.000Z",
  "isRecurring": false
}
```

---

### 5.4 Criar Bloqueio: Folga Específica

**POST** `/time-blocks` 🔒 _Requer token ADMIN_

```json
{
  "type": "DAY_OFF",
  "reason": "Consulta médica",
  "startsAt": "2025-01-15T08:00:00.000Z",
  "endsAt": "2025-01-15T12:00:00.000Z",
  "isRecurring": false
}
```

---

### 5.5 Listar Todos os Bloqueios

**GET** `/time-blocks` 🔓 _Público_

**Resposta (200):**

```json
[
  {
    "id": "uuid-bloqueio-1",
    "type": "LUNCH",
    "reason": "Horário de almoço",
    "startsAt": "2025-01-10T12:00:00.000Z",
    "endsAt": "2025-01-10T13:00:00.000Z",
    "isRecurring": true,
    "recurringDays": [1, 2, 3, 4, 5],
    "active": true
  },
  {
    "id": "uuid-bloqueio-2",
    "type": "BREAK",
    "reason": "Pausa para café",
    "startsAt": "2025-01-10T15:00:00.000Z",
    "endsAt": "2025-01-10T15:15:00.000Z",
    "isRecurring": true,
    "recurringDays": [1, 3, 5],
    "active": true
  }
]
```

---

### 5.6 Buscar Bloqueios por Período

**GET** `/time-blocks/range?startDate=2025-01-10T08:00:00.000Z&endDate=2025-01-10T20:00:00.000Z` 🔓 _Público_

---

## 6. Agendamentos

### 6.1 Criar Agendamento como ADMIN (Agendamento Manual)

**POST** `/appointments` 🔒 _Requer token (qualquer role)_

```json
{
  "startsAt": "2025-01-11T09:00:00.000Z",
  "serviceId": "uuid-servico-1",
  "clientName": "Pedro da Silva"
}
```

**Resposta (201):**

```json
{
  "id": "uuid-agendamento-1",
  "startsAt": "2025-01-11T09:00:00.000Z",
  "endsAt": "2025-01-11T09:30:00.000Z",
  "status": "CONFIRMED",
  "clientName": "Pedro da Silva",
  "userId": null,
  "serviceId": "uuid-servico-1",
  "service": {
    "id": "uuid-servico-1",
    "name": "Corte Simples",
    "price": "35.00",
    "durationMin": 30
  },
  "createdAt": "2025-01-10T11:00:00.000Z",
  "updatedAt": "2025-01-10T11:00:00.000Z"
}
```

**⚠️ Salve o `id` do agendamento!**

---

### 6.2 Criar Agendamento como CLIENT (Agendamento pelo App)

**POST** `/appointments` 🔒 _Requer token CLIENT_

```json
{
  "startsAt": "2025-01-11T10:00:00.000Z",
  "serviceId": "uuid-servico-2"
}
```

**Nota:** Quando o cliente está autenticado, não precisa informar `clientName`. O sistema usa o `userId` automaticamente.

**Resposta (201):**

```json
{
  "id": "uuid-agendamento-2",
  "startsAt": "2025-01-11T10:00:00.000Z",
  "endsAt": "2025-01-11T10:45:00.000Z",
  "status": "CONFIRMED",
  "clientName": null,
  "userId": "uuid-client",
  "user": {
    "id": "uuid-client",
    "name": "Maria Cliente",
    "email": "client@barberboss.com",
    "phone": "+5511977777777"
  },
  "serviceId": "uuid-servico-2",
  "service": {
    "id": "uuid-servico-2",
    "name": "Corte + Barba",
    "price": "60.00",
    "durationMin": 45
  },
  "createdAt": "2025-01-10T11:05:00.000Z",
  "updatedAt": "2025-01-10T11:05:00.000Z"
}
```

---

### 6.3 Listar Agendamentos (com Filtros)

**GET** `/appointments?status=CONFIRMED&page=1&limit=10` 🔒 _Requer token (qualquer role)_

**Parâmetros de Query:**

- `status`: PENDING, CONFIRMED, CANCELED, COMPLETED, NO_SHOW
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `startDate`: Filtrar por data início (ISO 8601)
- `endDate`: Filtrar por data fim (ISO 8601)

**Resposta (200):**

```json
{
  "data": [
    {
      "id": "uuid-agendamento-1",
      "startsAt": "2025-01-11T09:00:00.000Z",
      "endsAt": "2025-01-11T09:30:00.000Z",
      "status": "CONFIRMED",
      "clientName": "Pedro da Silva",
      "service": {
        "name": "Corte Simples",
        "price": "35.00"
      }
    },
    {
      "id": "uuid-agendamento-2",
      "startsAt": "2025-01-11T10:00:00.000Z",
      "endsAt": "2025-01-11T10:45:00.000Z",
      "status": "CONFIRMED",
      "user": {
        "name": "Maria Cliente"
      },
      "service": {
        "name": "Corte + Barba",
        "price": "60.00"
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "lastPage": 1
  }
}
```

---

### 6.4 Buscar Agendamento por ID

**GET** `/appointments/{id}` 🔒 _Requer token (qualquer role)_

---

### 6.5 Atualizar Agendamento (Mudar Horário)

**PATCH** `/appointments/{id}` 🔒 _Requer token ADMIN ou BARBER_

```json
{
  "startsAt": "2025-01-11T14:00:00.000Z"
}
```

---

### 6.6 Atualizar Status do Agendamento

**PATCH** `/appointments/{id}` 🔒 _Requer token ADMIN ou BARBER_

```json
{
  "status": "COMPLETED"
}
```

**Status Disponíveis:**

- `PENDING` - Aguardando confirmação
- `CONFIRMED` - Confirmado
- `CANCELED` - Cancelado
- `COMPLETED` - Concluído
- `NO_SHOW` - Cliente não compareceu

---

### 6.7 Cancelar Agendamento

**PATCH** `/appointments/{id}` 🔒 _Requer token_

```json
{
  "status": "CANCELED"
}
```

---

### 6.8 Deletar Agendamento

**DELETE** `/appointments/{id}` 🔒 _Requer token ADMIN_

**Resposta (204):** Sem conteúdo

---

## 7. Consulta de Horários Disponíveis

### 7.1 Buscar Horários Disponíveis para um Serviço

**GET** `/appointments/available-slots/search?date=2025-01-11&serviceId=uuid-servico-1` 🔓 _Público_

**Parâmetros de Query:**

- `date`: Data no formato YYYY-MM-DD (obrigatório)
- `serviceId`: UUID do serviço (obrigatório)

**Resposta (200):**

```json
{
  "date": "2025-01-11",
  "serviceId": "uuid-servico-1",
  "service": {
    "id": "uuid-servico-1",
    "name": "Corte Simples",
    "price": "35.00",
    "durationMin": 30
  },
  "availableSlots": [
    {
      "startsAt": "2025-01-11T09:00:00.000Z",
      "endsAt": "2025-01-11T09:30:00.000Z"
    },
    {
      "startsAt": "2025-01-11T09:30:00.000Z",
      "endsAt": "2025-01-11T10:00:00.000Z"
    },
    {
      "startsAt": "2025-01-11T10:00:00.000Z",
      "endsAt": "2025-01-11T10:30:00.000Z"
    },
    {
      "startsAt": "2025-01-11T13:00:00.000Z",
      "endsAt": "2025-01-11T13:30:00.000Z"
    },
    {
      "startsAt": "2025-01-11T13:30:00.000Z",
      "endsAt": "2025-01-11T14:00:00.000Z"
    }
  ]
}
```

**Nota:** Os horários entre 12:00 e 13:00 não aparecem porque há um bloqueio de almoço.

---

### 7.2 Buscar Horários para Serviço Longo (45min)

**GET** `/appointments/available-slots/search?date=2025-01-11&serviceId=uuid-servico-2` 🔓 _Público_

**Resposta (200):**

```json
{
  "date": "2025-01-11",
  "serviceId": "uuid-servico-2",
  "service": {
    "id": "uuid-servico-2",
    "name": "Corte + Barba",
    "price": "60.00",
    "durationMin": 45
  },
  "availableSlots": [
    {
      "startsAt": "2025-01-11T09:00:00.000Z",
      "endsAt": "2025-01-11T09:45:00.000Z"
    },
    {
      "startsAt": "2025-01-11T10:45:00.000Z",
      "endsAt": "2025-01-11T11:30:00.000Z"
    },
    {
      "startsAt": "2025-01-11T13:00:00.000Z",
      "endsAt": "2025-01-11T13:45:00.000Z"
    }
  ]
}
```

**Nota:** Menos slots disponíveis porque o serviço é mais longo.

---

## 🔄 Fluxo Completo de Teste

### Cenário 1: Cliente Agendando pelo App

```bash
# 1. Cliente se registra
POST /auth/register
{
  "name": "José Santos",
  "email": "jose@email.com",
  "password": "Senha@123",
  "role": "CLIENT"
}

# 2. Cliente faz login
POST /auth/login
{
  "email": "jose@email.com",
  "password": "Senha@123"
}
# Salvar o access_token

# 3. Cliente consulta serviços disponíveis
GET /services

# 4. Cliente consulta horários disponíveis
GET /appointments/available-slots/search?date=2025-01-15&serviceId=uuid-servico-1

# 5. Cliente cria agendamento
POST /appointments
Authorization: Bearer {token_cliente}
{
  "startsAt": "2025-01-15T10:00:00.000Z",
  "serviceId": "uuid-servico-1"
}

# 6. Cliente consulta seus agendamentos
GET /appointments
Authorization: Bearer {token_cliente}
```

---

### Cenário 2: Admin Configurando Sistema

```bash
# 1. Admin faz login
POST /auth/login
{
  "email": "admin@barberboss.com",
  "password": "Admin@123"
}
# Salvar o access_token

# 2. Admin cria serviços
POST /services
Authorization: Bearer {token_admin}
{
  "name": "Corte Degradê",
  "description": "Corte degradê profissional",
  "price": 50.00,
  "durationMin": 40
}

# 3. Admin configura horário de funcionamento
PATCH /settings
Authorization: Bearer {token_admin}
{
  "openTime": "08:00",
  "closeTime": "20:00",
  "workingDays": [1, 2, 3, 4, 5, 6]
}

# 4. Admin cria bloqueio de almoço
POST /time-blocks
Authorization: Bearer {token_admin}
{
  "type": "LUNCH",
  "reason": "Almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5, 6]
}

# 5. Admin marca férias
POST /time-blocks
Authorization: Bearer {token_admin}
{
  "type": "VACATION",
  "reason": "Férias",
  "startsAt": "2025-07-01T00:00:00.000Z",
  "endsAt": "2025-07-15T23:59:59.000Z",
  "isRecurring": false
}
```

---

### Cenário 3: Barbeiro Gerenciando Agendamentos

```bash
# 1. Barbeiro faz login
POST /auth/login
{
  "email": "barber@barberboss.com",
  "password": "Barber@123"
}
# Salvar o access_token

# 2. Barbeiro cria agendamento manual (cliente via WhatsApp)
POST /appointments
Authorization: Bearer {token_barber}
{
  "startsAt": "2025-01-12T09:00:00.000Z",
  "serviceId": "uuid-servico-1",
  "clientName": "João do WhatsApp"
}

# 3. Barbeiro lista agendamentos do dia
GET /appointments?startDate=2025-01-12T00:00:00.000Z&endDate=2025-01-12T23:59:59.000Z
Authorization: Bearer {token_barber}

# 4. Barbeiro marca serviço como concluído
PATCH /appointments/{id}
Authorization: Bearer {token_barber}
{
  "status": "COMPLETED"
}

# 5. Cliente não compareceu
PATCH /appointments/{id}
Authorization: Bearer {token_barber}
{
  "status": "NO_SHOW"
}
```

---

## 🎯 Validações Importantes

### ❌ Tentativa de agendar em horário bloqueado

```json
POST /appointments
{
  "startsAt": "2025-01-11T12:30:00.000Z",
  "serviceId": "uuid-servico-1"
}
```

**Resposta (400):**

```json
{
  "statusCode": 400,
  "message": "Horário bloqueado"
}
```

---

### ❌ Tentativa de agendar fora do horário comercial

```json
POST /appointments
{
  "startsAt": "2025-01-11T22:00:00.000Z",
  "serviceId": "uuid-servico-1"
}
```

**Resposta (400):**

```json
{
  "statusCode": 400,
  "message": "Horário fora do expediente da barbearia"
}
```

---

### ❌ Tentativa de agendar em horário já ocupado

```json
POST /appointments
{
  "startsAt": "2025-01-11T09:00:00.000Z",
  "serviceId": "uuid-servico-1"
}
```

**Resposta (400):**

```json
{
  "statusCode": 400,
  "message": "Já existe um agendamento para este horário"
}
```

---

## 📊 Resumo de Permissões

| Endpoint              | ADMIN | BARBER | CLIENT | Público |
| --------------------- | ----- | ------ | ------ | ------- |
| POST /auth/register   | ✅    | ✅     | ✅     | ✅      |
| POST /auth/login      | ✅    | ✅     | ✅     | ✅      |
| GET /auth/me          | ✅    | ✅     | ✅     | ❌      |
| POST /services        | ✅    | ❌     | ❌     | ❌      |
| GET /services         | ✅    | ✅     | ✅     | ✅      |
| GET /settings         | ✅    | ✅     | ✅     | ✅      |
| PATCH /settings       | ✅    | ❌     | ❌     | ❌      |
| POST /time-blocks     | ✅    | ❌     | ❌     | ❌      |
| GET /time-blocks      | ✅    | ✅     | ✅     | ✅      |
| POST /appointments    | ✅    | ✅     | ✅     | ❌      |
| GET /appointments     | ✅    | ✅     | ✅     | ❌      |
| GET /appointments/:id | ✅    | ✅     | ✅     | ❌      |
| PATCH /appointments   | ✅    | ✅     | ❌\*\* | ❌      |
| DELETE /appointments  | ✅    | ❌     | ❌     | ❌      |
| GET /available-slots  | ✅    | ✅     | ✅     | ✅      |

\*\* Cliente pode cancelar apenas seus próprios agendamentos

---

## 🚀 Testando no Swagger

1. Acesse: `http://localhost:3000/api`
2. Execute os endpoints na ordem deste guia
3. Para endpoints protegidos, use o botão 🔒 "Authorize"
4. Cole o `access_token` obtido no login
5. Os exemplos acima já estão pré-configurados no Swagger!
