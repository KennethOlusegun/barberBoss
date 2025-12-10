# 🧪 Payloads para Teste - Time Blocks API

## 📝 Exemplos de Payloads para Swagger

### 1. Criar Bloqueio de Almoço Recorrente (Segunda a Sexta)

**POST** `/time-blocks`

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

**Resposta Esperada (201):**
```json
{
  "id": "uuid-gerado",
  "type": "LUNCH",
  "reason": "Horário de almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5],
  "active": true,
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

---

### 2. Criar Pausa para Café (Segundas, Quartas e Sextas)

**POST** `/time-blocks`

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

### 3. Criar Férias (Bloqueio Único)

**POST** `/time-blocks`

```json
{
  "type": "VACATION",
  "reason": "Férias de verão",
  "startsAt": "2025-07-01T00:00:00.000Z",
  "endsAt": "2025-07-15T23:59:59.000Z",
  "isRecurring": false
}
```

---

### 4. Criar Folga em Dia Específico

**POST** `/time-blocks`

```json
{
  "type": "DAY_OFF",
  "reason": "Consulta médica",
  "startsAt": "2025-01-15T08:00:00.000Z",
  "endsAt": "2025-01-15T18:00:00.000Z",
  "isRecurring": false
}
```

---

### 5. Criar Bloqueio Personalizado

**POST** `/time-blocks`

```json
{
  "type": "CUSTOM",
  "reason": "Treinamento da equipe",
  "startsAt": "2025-01-20T14:00:00.000Z",
  "endsAt": "2025-01-20T17:00:00.000Z",
  "isRecurring": false
}
```

---

### 6. Atualizar Bloqueio (Estender Almoço)

**PATCH** `/time-blocks/{id}`

```json
{
  "reason": "Almoço estendido",
  "endsAt": "2025-01-10T13:30:00.000Z"
}
```

---

### 7. Atualizar Bloqueio (Mudar Dias Recorrentes)

**PATCH** `/time-blocks/{id}`

```json
{
  "recurringDays": [1, 2, 3, 4]
}
```

---

### 8. Desativar Bloqueio

**PATCH** `/time-blocks/{id}`

```json
{
  "active": false
}
```

---

## 🔍 Exemplos de Consultas

### 1. Listar Todos os Bloqueios

**GET** `/time-blocks`

Sem parâmetros. Retorna todos os bloqueios ativos.

---

### 2. Buscar Bloqueios por Período

**GET** `/time-blocks/range?startDate=2025-01-10T08:00:00.000Z&endDate=2025-01-10T18:00:00.000Z`

**Parâmetros de Query:**
- `startDate`: Data/hora início do período (ISO 8601)
- `endDate`: Data/hora fim do período (ISO 8601)

---

### 3. Buscar Bloqueio por ID

**GET** `/time-blocks/{id}`

Substitua `{id}` pelo UUID do bloqueio.

---

### 4. Remover Bloqueio (Soft Delete)

**DELETE** `/time-blocks/{id}`

Marca o bloqueio como inativo (`active: false`).

---

## 🔐 Autenticação

### Endpoints que Requerem Autenticação (ADMIN):

- `POST /time-blocks`
- `PATCH /time-blocks/{id}`
- `DELETE /time-blocks/{id}`

**Header necessário:**
```
Authorization: Bearer {seu_token_jwt}
```

### Como obter o token:

1. Faça login:
   ```bash
   POST /auth/login
   {
     "email": "admin@barberboss.com",
     "password": "sua_senha"
   }
   ```

2. Use o `access_token` retornado no header `Authorization`

---

## 📅 Referência de Dias da Semana

Para `recurringDays`:

| Número | Dia da Semana |
|--------|---------------|
| 0      | Domingo       |
| 1      | Segunda-feira |
| 2      | Terça-feira   |
| 3      | Quarta-feira  |
| 4      | Quinta-feira  |
| 5      | Sexta-feira   |
| 6      | Sábado        |

**Exemplos:**
- `[1, 2, 3, 4, 5]` - Segunda a Sexta
- `[0, 6]` - Final de semana
- `[1, 3, 5]` - Segundas, Quartas e Sextas

---

## ✅ Cenários de Teste Completos

### Cenário 1: Configurar Rotina de Trabalho

```json
// 1. Almoço diário (12h-13h)
POST /time-blocks
{
  "type": "LUNCH",
  "reason": "Horário de almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5]
}

// 2. Pausa da tarde (15h-15:15h) - Seg/Qua/Sex
POST /time-blocks
{
  "type": "BREAK",
  "reason": "Pausa para café",
  "startsAt": "2025-01-10T15:00:00.000Z",
  "endsAt": "2025-01-10T15:15:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 3, 5]
}
```

### Cenário 2: Marcar Férias

```json
POST /time-blocks
{
  "type": "VACATION",
  "reason": "Férias de fim de ano",
  "startsAt": "2025-12-20T00:00:00.000Z",
  "endsAt": "2025-12-31T23:59:59.000Z",
  "isRecurring": false
}
```

### Cenário 3: Folga Esporádica

```json
POST /time-blocks
{
  "type": "DAY_OFF",
  "reason": "Consulta médica",
  "startsAt": "2025-01-15T08:00:00.000Z",
  "endsAt": "2025-01-15T12:00:00.000Z",
  "isRecurring": false
}
```

---

## 🧩 Validações Esperadas

### ❌ Erro: Data Inválida

```json
POST /time-blocks
{
  "type": "LUNCH",
  "startsAt": "2025-01-10T13:00:00.000Z",
  "endsAt": "2025-01-10T12:00:00.000Z"  // endsAt ANTES de startsAt
}
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "A data de início deve ser anterior à data de término"
}
```

### ❌ Erro: Bloqueio Recorrente sem Dias

```json
POST /time-blocks
{
  "type": "LUNCH",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true
  // Faltando recurringDays
}
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "recurringDays é obrigatório quando isRecurring é true"
}
```

### ❌ Erro: Tipo de Bloqueio Inválido

```json
POST /time-blocks
{
  "type": "INVALID_TYPE",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z"
}
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "type deve ser um valor válido: LUNCH, BREAK, DAY_OFF, VACATION, CUSTOM"
}
```

---

## 🎯 Como Testar no Swagger

1. Acesse: `http://localhost:3000/api`
2. Localize a seção **time-blocks**
3. Para endpoints protegidos:
   - Clique no cadeado 🔒
   - Cole seu token JWT
   - Clique em "Authorize"
4. Selecione o endpoint desejado
5. Clique em "Try it out"
6. Cole o payload de exemplo
7. Clique em "Execute"

---

## 📊 Tipos de Bloqueio Disponíveis

| Tipo      | Descrição                    | Uso Recomendado                |
|-----------|------------------------------|--------------------------------|
| LUNCH     | Horário de almoço            | Recorrente (diário)            |
| BREAK     | Pausa/intervalo              | Recorrente (dias específicos)  |
| DAY_OFF   | Folga                        | Único (dia específico)         |
| VACATION  | Férias                       | Único (período)                |
| CUSTOM    | Personalizado                | Qualquer situação especial     |
