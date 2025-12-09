# Sistema de Configurações (Settings)

## Visão Geral

O módulo Settings gerencia todas as configurações da barbearia de forma centralizada e persistente no banco de dados. Ele permite configurar horários de funcionamento, dias úteis, regras de agendamento e muito mais.

## Estrutura do Banco de Dados

```prisma
model Settings {
  id                String   @id @default(uuid())
  businessName      String   @default("Barber Boss")
  
  // Horário comercial
  openTime          String   @default("08:00") // Formato HH:mm
  closeTime         String   @default("18:00") // Formato HH:mm
  
  // Dias de funcionamento (0=Domingo, 6=Sábado)
  workingDays       Int[]    @default([1, 2, 3, 4, 5, 6]) // Segunda a Sábado
  
  // Intervalo entre agendamentos (em minutos)
  slotIntervalMin   Int      @default(15)
  
  // Configurações de agendamento
  maxAdvanceDays    Int      @default(30)  // Quantos dias no futuro pode agendar
  minAdvanceHours   Int      @default(2)   // Mínimo de horas de antecedência
  
  // Notificações (para futuro)
  enableReminders   Boolean  @default(false)
  reminderHoursBefore Int    @default(24)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## API Endpoints

### 1. Obter Configurações

```http
GET /api/settings
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "id": "uuid",
  "businessName": "Barber Boss",
  "openTime": "08:00",
  "closeTime": "18:00",
  "workingDays": [1, 2, 3, 4, 5, 6],
  "slotIntervalMin": 15,
  "maxAdvanceDays": 30,
  "minAdvanceHours": 2,
  "enableReminders": false,
  "reminderHoursBefore": 24,
  "createdAt": "2025-12-09T05:57:01.000Z",
  "updatedAt": "2025-12-09T05:57:01.000Z"
}
```

### 2. Atualizar Configurações (Apenas ADMIN)

```http
PATCH /api/settings
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**
```json
{
  "businessName": "Minha Barbearia",
  "openTime": "09:00",
  "closeTime": "19:00",
  "workingDays": [1, 2, 3, 4, 5],
  "maxAdvanceDays": 60
}
```

**Resposta de Sucesso (200)**
```json
{
  "id": "uuid",
  "businessName": "Minha Barbearia",
  "openTime": "09:00",
  "closeTime": "19:00",
  "workingDays": [1, 2, 3, 4, 5],
  "slotIntervalMin": 15,
  "maxAdvanceDays": 60,
  "minAdvanceHours": 2,
  "enableReminders": false,
  "reminderHoursBefore": 24,
  "createdAt": "2025-12-09T05:57:01.000Z",
  "updatedAt": "2025-12-09T06:30:00.000Z"
}
```

## Configurações Disponíveis

### businessName
- **Tipo**: String
- **Padrão**: "Barber Boss"
- **Descrição**: Nome da barbearia
- **Validação**: 2-100 caracteres

### openTime
- **Tipo**: String (HH:mm)
- **Padrão**: "08:00"
- **Descrição**: Horário de abertura
- **Validação**: Formato HH:mm (ex: 08:00)

### closeTime
- **Tipo**: String (HH:mm)
- **Padrão**: "18:00"
- **Descrição**: Horário de fechamento
- **Validação**: Formato HH:mm, deve ser posterior ao openTime

### workingDays
- **Tipo**: Array de números
- **Padrão**: [1, 2, 3, 4, 5, 6] (Segunda a Sábado)
- **Descrição**: Dias da semana de funcionamento
- **Valores**: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
- **Validação**: 1-7 dias únicos, valores entre 0-6

### slotIntervalMin
- **Tipo**: Número inteiro
- **Padrão**: 15
- **Descrição**: Intervalo mínimo entre slots de agendamento (minutos)
- **Validação**: 5-120 minutos

### maxAdvanceDays
- **Tipo**: Número inteiro
- **Padrão**: 30
- **Descrição**: Quantos dias no futuro o cliente pode agendar
- **Validação**: 1-365 dias

### minAdvanceHours
- **Tipo**: Número inteiro
- **Padrão**: 2
- **Descrição**: Mínimo de horas de antecedência para agendamento
- **Validação**: 0-72 horas

### enableReminders
- **Tipo**: Boolean
- **Padrão**: false
- **Descrição**: Ativar lembretes de agendamento (funcionalidade futura)

### reminderHoursBefore
- **Tipo**: Número inteiro
- **Padrão**: 24
- **Descrição**: Quantas horas antes enviar lembrete
- **Validação**: 1-168 horas (7 dias)

## Integração com Agendamentos

O módulo Settings é integrado automaticamente no `AppointmentService` para validar:

### 1. Horário Comercial
```typescript
// Valida se o agendamento está dentro do horário de funcionamento
await this.validateBusinessHours(startsAt, 'início');
await this.validateBusinessHours(endsAt, 'término');
```

### 2. Dias Úteis
```typescript
// Verifica se o dia está em workingDays
if (!settings.workingDays.includes(day)) {
  throw new BadRequestException('Dia não útil');
}
```

### 3. Antecedência Mínima
```typescript
// Valida se o agendamento respeita minAdvanceHours
const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
if (date.getTime() - now.getTime() < minAdvanceMs) {
  throw new BadRequestException('Antecedência mínima não respeitada');
}
```

### 4. Antecedência Máxima
```typescript
// Valida se o agendamento não excede maxAdvanceDays
const maxAdvanceMs = settings.maxAdvanceDays * 24 * 60 * 60 * 1000;
if (date.getTime() - now.getTime() > maxAdvanceMs) {
  throw new BadRequestException('Antecedência máxima excedida');
}
```

## Exemplos de Uso

### Exemplo 1: Configurar Horário Estendido

```bash
curl -X PATCH http://localhost:3000/api/settings \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "openTime": "07:00",
    "closeTime": "20:00"
  }'
```

### Exemplo 2: Trabalhar Apenas em Dias de Semana

```bash
curl -X PATCH http://localhost:3000/api/settings \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "workingDays": [1, 2, 3, 4, 5]
  }'
```

### Exemplo 3: Permitir Agendamento com 1 Hora de Antecedência

```bash
curl -X PATCH http://localhost:3000/api/settings \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "minAdvanceHours": 1
  }'
```

## Mensagens de Erro

### Horário Fora do Expediente
```json
{
  "statusCode": 400,
  "message": "O horário de início (07:00) está fora do horário comercial (08:00 - 18:00)",
  "error": "Bad Request"
}
```

### Dia Não Útil
```json
{
  "statusCode": 400,
  "message": "O horário de início (Domingo) não é um dia útil. Horário comercial: Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado",
  "error": "Bad Request"
}
```

### Antecedência Mínima Não Respeitada
```json
{
  "statusCode": 400,
  "message": "O agendamento deve ser feito com pelo menos 2 hora(s) de antecedência",
  "error": "Bad Request"
}
```

### Antecedência Máxima Excedida
```json
{
  "statusCode": 400,
  "message": "O agendamento não pode ser feito com mais de 30 dias de antecedência",
  "error": "Bad Request"
}
```

### Horário Inválido
```json
{
  "statusCode": 400,
  "message": "O horário de abertura deve ser anterior ao horário de fechamento",
  "error": "Bad Request"
}
```

## Cache de Configurações

O `SettingsService` implementa um cache simples de 1 minuto para otimizar performance:

```typescript
private cachedSettings: Settings | null = null;
private lastCacheTime: number = 0;
private readonly CACHE_DURATION_MS = 60000; // 1 minuto
```

Para forçar atualização do cache:
```typescript
await settingsService.refreshCache();
```

## Permissões

- **GET /api/settings**: Qualquer usuário autenticado
- **PATCH /api/settings**: Apenas usuários com role `ADMIN`

## Inicialização

Se não houver configurações no banco de dados, o sistema cria automaticamente uma linha com valores padrão no primeiro acesso:

```typescript
{
  businessName: 'Barber Boss',
  openTime: '08:00',
  closeTime: '18:00',
  workingDays: [1, 2, 3, 4, 5, 6],
  slotIntervalMin: 15,
  maxAdvanceDays: 30,
  minAdvanceHours: 2,
  enableReminders: false,
  reminderHoursBefore: 24,
}
```

## Arquivos Relacionados

- **Schema**: `backend/prisma/schema.prisma`
- **Module**: `backend/src/modules/settings/settings.module.ts`
- **Service**: `backend/src/modules/settings/settings.service.ts`
- **Controller**: `backend/src/modules/settings/settings.controller.ts`
- **DTOs**: `backend/src/modules/settings/dto/`
- **Entity**: `backend/src/modules/settings/entities/settings.entity.ts`

## Próximos Passos

1. ✅ Sistema de configurações implementado
2. ✅ Validação dinâmica de horário comercial
3. ✅ Validação de antecedência mínima/máxima
4. 🔄 Implementar sistema de lembretes (enableReminders)
5. 🔄 Adicionar configuração de feriados
6. 🔄 Implementar horários especiais por dia da semana
7. 🔄 Adicionar configuração de tempo de pausa entre atendimentos

## Notas Técnicas

- Apenas uma linha de configuração é mantida no banco (garantido pela aplicação)
- Atualizações são parciais (PATCH) - apenas campos fornecidos são atualizados
- Cache automático de 1 minuto para reduzir queries ao banco
- Validações robustas em DTO e Service
- Integração transparente com sistema de agendamentos
