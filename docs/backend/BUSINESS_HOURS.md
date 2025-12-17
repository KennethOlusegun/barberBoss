# Validação de Horário Comercial

## ⚠️ ATUALIZAÇÃO IMPORTANTE

Este sistema foi atualizado e agora usa **configurações dinâmicas** armazenadas no banco de dados através do módulo **Settings**.

📖 **Veja a documentação completa em**: [SETTINGS.md](./SETTINGS.md)

---

## Visão Geral

O sistema de agendamentos possui validação automática de horário comercial baseada nas configurações da barbearia armazenadas no banco de dados. As configurações são totalmente customizáveis através da API.

## Configuração Padrão

- **Horário de Funcionamento**: 8:00 - 18:00
- **Dias de Funcionamento**: Segunda a Sábado (1-6)
- **Dias Fechados**: Domingo (0)

## Validações Implementadas

### 1. Validação no DTO (CreateAppointmentDto)

O decorator `@IsBusinessHours` valida o campo `startsAt` automaticamente:

```typescript
@IsBusinessHours({
  startHour: 8,
  endHour: 18,
  workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
})
startsAt: string;
```

### 2. Validação no Service

O método `validateBusinessHours()` valida tanto o horário de início quanto o de término:

- Verifica se a data é em um dia útil (Segunda a Sábado)
- Verifica se o horário está entre 8:00 e 18:00
- Valida que serviços não se estendam além do horário comercial

## Mensagens de Erro

### Dia não útil (Domingo)

```json
{
  "statusCode": 400,
  "message": "O horário de início (Domingo) não é um dia útil. Horário comercial: Segunda a Sábado",
  "error": "Bad Request"
}
```

### Horário fora do expediente

```json
{
  "statusCode": 400,
  "message": "O horário de início (07:00) está fora do horário comercial (8:00 - 18:00)",
  "error": "Bad Request"
}
```

### Serviço estendendo além do horário comercial

```json
{
  "statusCode": 400,
  "message": "O horário de término (18:30) está fora do horário comercial (8:00 - 18:00)",
  "error": "Bad Request"
}
```

## Exemplos de Uso

### ✅ Agendamento Válido

```json
POST /api/appointments
{
  "startsAt": "2025-12-09T10:00:00.000Z",
  "serviceId": "uuid-do-servico",
  "userId": "uuid-do-usuario"
}
```

**Resultado**: Agendamento criado com sucesso (Segunda-feira às 10:00)

### ❌ Agendamento em Domingo

```json
POST /api/appointments
{
  "startsAt": "2025-12-14T10:00:00.000Z",
  "serviceId": "uuid-do-servico",
  "userId": "uuid-do-usuario"
}
```

**Resultado**: Erro 400 - Domingo não é dia útil

### ❌ Agendamento antes das 8h

```json
POST /api/appointments
{
  "startsAt": "2025-12-09T07:00:00.000Z",
  "serviceId": "uuid-do-servico",
  "userId": "uuid-do-usuario"
}
```

**Resultado**: Erro 400 - Fora do horário comercial

### ❌ Serviço que termina após 18h

```json
POST /api/appointments
{
  "startsAt": "2025-12-09T17:30:00.000Z",
  "serviceId": "uuid-servico-de-2-horas",
  "userId": "uuid-do-usuario"
}
```

**Resultado**: Erro 400 - Horário de término fora do expediente (caso o serviço termine às 19:30)

## Customização

Para alterar o horário comercial, use a API de Settings (requer permissão ADMIN):

```bash
curl -X PATCH http://localhost:3000/api/settings \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "openTime": "09:00",
    "closeTime": "19:00",
    "workingDays": [1, 2, 3, 4, 5, 6]
  }'
```

**Veja todas as opções disponíveis em**: [SETTINGS.md](./SETTINGS.md)

````

## Comportamento em Updates

Ao atualizar um agendamento (PATCH/PUT), as mesmas validações se aplicam:

```json
PATCH /api/appointments/:id
{
  "startsAt": "2025-12-09T19:00:00.000Z"
}
````

**Resultado**: Erro 400 - Fora do horário comercial

## Integração com Duração de Serviços

O sistema calcula automaticamente o `endsAt` baseado na duração do serviço e valida se o término também está dentro do horário comercial:

1. Cliente agenda serviço de 2 horas às 17:00
2. Sistema calcula `endsAt` = 19:00
3. Sistema valida e rejeita pois 19:00 está fora do horário comercial

## Notas Técnicas

- O decorator é reutilizável e pode ser aplicado em outros módulos (validação básica)
- A validação principal ocorre no `AppointmentService` usando configurações dinâmicas do banco de dados
- O `UpdateAppointmentDto` herda automaticamente as validações do `CreateAppointmentDto`
- As configurações são cacheadas por 1 minuto para otimizar performance
- Validações adicionais: antecedência mínima e máxima configuráveis

## Validações Adicionais

Além do horário comercial, o sistema também valida:

1. **Antecedência Mínima**: Configurável via `minAdvanceHours` (padrão: 2 horas)
2. **Antecedência Máxima**: Configurável via `maxAdvanceDays` (padrão: 30 dias)
3. **Dias Úteis**: Configurável via `workingDays` array

## Arquivos Relacionados

- `src/decorators/is-business-hours.decorator.ts` - Decorator customizado (validação DTO)
- `src/modules/appointment/dto/create-appointment.dto.ts` - DTO com validação básica
- `src/modules/appointment/appointment.service.ts` - Lógica de validação completa
- `src/modules/settings/settings.service.ts` - Serviço de configurações
- `docs/backend/SETTINGS.md` - Documentação completa do sistema de configurações
