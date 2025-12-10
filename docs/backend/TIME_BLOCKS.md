# 🚫 Time Blocks - Bloqueio de Horários

## 📋 Visão Geral

O módulo **TimeBlock** permite bloquear horários específicos para impedir agendamentos, útil para:
- 🍽️ **Horários de almoço**
- ☕ **Pausas/intervalos**
- 🏖️ **Folgas e férias**
- 🛠️ **Manutenções ou eventos especiais**

## 🎯 Funcionalidades

### 1. Tipos de Bloqueio

```typescript
enum BlockType {
  LUNCH    // Horário de almoço
  BREAK    // Pausa/intervalo
  DAY_OFF  // Folga (dia inteiro)
  VACATION // Férias
  CUSTOM   // Personalizado
}
```

### 2. Bloqueios Recorrentes

Permite criar bloqueios que se repetem em dias específicos da semana:

```typescript
// Exemplo: Almoço das 12h às 13h todos os dias úteis
{
  "type": "LUNCH",
  "reason": "Horário de almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5] // Segunda a Sexta
}
```

**Dias da semana:**
- `0` = Domingo
- `1` = Segunda-feira
- `2` = Terça-feira
- `3` = Quarta-feira
- `4` = Quinta-feira
- `5` = Sexta-feira
- `6` = Sábado

### 3. Bloqueios Únicos

Para eventos pontuais (férias, consulta médica, etc.):

```typescript
{
  "type": "VACATION",
  "reason": "Férias de fim de ano",
  "startsAt": "2025-12-20T08:00:00.000Z",
  "endsAt": "2025-12-31T18:00:00.000Z",
  "isRecurring": false
}
```

## 🔗 API Endpoints

### 1. Criar Bloqueio de Horário

**`POST /time-blocks`** 🔒 Requer autenticação (ADMIN)

```bash
curl -X POST http://localhost:3000/time-blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "type": "LUNCH",
    "reason": "Horário de almoço",
    "startsAt": "2025-01-10T12:00:00.000Z",
    "endsAt": "2025-01-10T13:00:00.000Z",
    "isRecurring": true,
    "recurringDays": [1, 2, 3, 4, 5]
  }'
```

**Resposta (201):**
```json
{
  "id": "uuid-do-bloqueio",
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

**Validações:**
- ✅ `startsAt` deve ser anterior a `endsAt`
- ✅ Se `isRecurring` for `true`, `recurringDays` é obrigatório
- ✅ `recurringDays` deve conter valores entre 0-6

---

### 2. Listar Todos os Bloqueios

**`GET /time-blocks`** 🔓 Público

```bash
curl http://localhost:3000/time-blocks
```

**Resposta (200):**
```json
[
  {
    "id": "uuid-1",
    "type": "LUNCH",
    "reason": "Horário de almoço",
    "startsAt": "2025-01-10T12:00:00.000Z",
    "endsAt": "2025-01-10T13:00:00.000Z",
    "isRecurring": true,
    "recurringDays": [1, 2, 3, 4, 5],
    "active": true,
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "type": "VACATION",
    "reason": "Férias",
    "startsAt": "2025-12-20T08:00:00.000Z",
    "endsAt": "2025-12-31T18:00:00.000Z",
    "isRecurring": false,
    "recurringDays": [],
    "active": true,
    "createdAt": "2025-01-05T14:00:00.000Z",
    "updatedAt": "2025-01-05T14:00:00.000Z"
  }
]
```

---

### 3. Buscar Bloqueios por Período

**`GET /time-blocks/range?start=...&end=...`** 🔓 Público

```bash
curl "http://localhost:3000/time-blocks/range?start=2025-01-10T08:00:00.000Z&end=2025-01-10T18:00:00.000Z"
```

**Resposta (200):**
```json
[
  {
    "id": "uuid-1",
    "type": "LUNCH",
    "reason": "Horário de almoço",
    "startsAt": "2025-01-10T12:00:00.000Z",
    "endsAt": "2025-01-10T13:00:00.000Z",
    "isRecurring": true,
    "recurringDays": [1, 2, 3, 4, 5]
  }
]
```

**Nota:** Este endpoint retorna:
- Bloqueios únicos que sobrepõem o período
- Bloqueios recorrentes cujo dia da semana coincide com o período

---

### 4. Buscar Bloqueio por ID

**`GET /time-blocks/:id`** 🔓 Público

```bash
curl http://localhost:3000/time-blocks/uuid-do-bloqueio
```

**Resposta (200):**
```json
{
  "id": "uuid-do-bloqueio",
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

**Resposta (404):**
```json
{
  "statusCode": 404,
  "message": "Bloqueio de horário não encontrado"
}
```

---

### 5. Atualizar Bloqueio

**`PATCH /time-blocks/:id`** 🔒 Requer autenticação (ADMIN)

```bash
curl -X PATCH http://localhost:3000/time-blocks/uuid-do-bloqueio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "reason": "Almoço estendido",
    "endsAt": "2025-01-10T13:30:00.000Z"
  }'
```

**Campos atualizáveis:**
- `type`
- `reason`
- `startsAt`
- `endsAt`
- `isRecurring`
- `recurringDays`
- `active`

**Resposta (200):**
```json
{
  "id": "uuid-do-bloqueio",
  "type": "LUNCH",
  "reason": "Almoço estendido",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:30:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5],
  "active": true,
  "updatedAt": "2025-01-10T15:00:00.000Z"
}
```

---

### 6. Remover Bloqueio (Soft Delete)

**`DELETE /time-blocks/:id`** 🔒 Requer autenticação (ADMIN)

```bash
curl -X DELETE http://localhost:3000/time-blocks/uuid-do-bloqueio \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta (200):**
```json
{
  "message": "Bloqueio de horário removido com sucesso"
}
```

**Nota:** O bloqueio não é excluído do banco, apenas marcado como `active: false`.

---

## 🔄 Integração com Agendamentos

### 1. Validação Automática

Ao criar ou atualizar um agendamento, o sistema verifica automaticamente se há bloqueios:

```typescript
// Em appointment.service.ts
async create(createAppointmentDto: CreateAppointmentDto) {
  // ... validações de horário comercial ...
  
  // Verifica se há bloqueio no horário
  const isBlocked = await this.timeBlockService.isBlocked(startsAt, endsAt);
  if (isBlocked) {
    throw new BadRequestException('Horário bloqueado');
  }
  
  // ... criar agendamento ...
}
```

### 2. Filtro em Horários Disponíveis

O endpoint `/appointments/available-slots/search` automaticamente remove horários bloqueados:

```typescript
// Slots disponíveis já excluem bloqueios
const availableSlots = await appointmentService.getAvailableSlots({
  date: '2025-01-10',
  serviceId: 'uuid-servico'
});
```

---

## 💡 Casos de Uso

### 1. Configurar Almoço Diário

```bash
POST /time-blocks
{
  "type": "LUNCH",
  "reason": "Horário de almoço",
  "startsAt": "2025-01-10T12:00:00.000Z",
  "endsAt": "2025-01-10T13:00:00.000Z",
  "isRecurring": true,
  "recurringDays": [1, 2, 3, 4, 5]
}
```

### 2. Marcar Férias

```bash
POST /time-blocks
{
  "type": "VACATION",
  "reason": "Férias de verão",
  "startsAt": "2025-07-01T00:00:00.000Z",
  "endsAt": "2025-07-15T23:59:59.000Z",
  "isRecurring": false
}
```

### 3. Folga em Dia Específico

```bash
POST /time-blocks
{
  "type": "DAY_OFF",
  "reason": "Consulta médica",
  "startsAt": "2025-01-15T08:00:00.000Z",
  "endsAt": "2025-01-15T18:00:00.000Z",
  "isRecurring": false
}
```

### 4. Pausa para Café (Segunda, Quarta, Sexta)

```bash
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

---

## 🎨 Schema do Banco de Dados

```prisma
model TimeBlock {
  id            String   @id @default(uuid())
  type          BlockType
  reason        String?  // Motivo do bloqueio
  startsAt      DateTime
  endsAt        DateTime
  isRecurring   Boolean  @default(false)
  recurringDays Int[]    @default([]) // [0-6] = Domingo a Sábado
  active        Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔐 Permissões

| Endpoint | Método | Público | ADMIN | BARBER | CLIENT |
|----------|--------|---------|-------|--------|--------|
| `/time-blocks` | POST | ❌ | ✅ | ❌ | ❌ |
| `/time-blocks` | GET | ✅ | ✅ | ✅ | ✅ |
| `/time-blocks/range` | GET | ✅ | ✅ | ✅ | ✅ |
| `/time-blocks/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| `/time-blocks/:id` | PATCH | ❌ | ✅ | ❌ | ❌ |
| `/time-blocks/:id` | DELETE | ❌ | ✅ | ❌ | ❌ |

---

## 🧪 Testes Rápidos

### Criar Bloqueio de Teste

```bash
# 1. Fazer login como ADMIN
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barberboss.com","password":"senha"}' \
  | jq -r '.access_token')

# 2. Criar bloqueio de almoço
curl -X POST http://localhost:3000/time-blocks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LUNCH",
    "reason": "Almoço",
    "startsAt": "2025-01-10T12:00:00.000Z",
    "endsAt": "2025-01-10T13:00:00.000Z",
    "isRecurring": true,
    "recurringDays": [1,2,3,4,5]
  }'

# 3. Verificar bloqueios
curl http://localhost:3000/time-blocks
```

---

## 📚 Documentos Relacionados

- [SETTINGS.md](./SETTINGS.md) - Configurações da barbearia
- [AVAILABLE_SLOTS.md](./AVAILABLE_SLOTS.md) - Horários disponíveis
- [AUTH.md](./AUTH.md) - Autenticação e autorização
- [PAGINATION.md](./PAGINATION.md) - Sistema de paginação
