# Endpoint de Horários Disponíveis

## Visão Geral

O endpoint `/appointments/available-slots/search` retorna todos os horários disponíveis para agendamento em uma data específica, considerando:

- Horário comercial da barbearia
- Duração do serviço selecionado
- Agendamentos já existentes
- Antecedência mínima configurada
- Intervalo entre slots configurado

## Endpoint

```http
GET /api/appointments/available-slots/search?date={data}&serviceId={uuid}
```

### Parâmetros Query

| Parâmetro   | Tipo              | Obrigatório | Descrição                                              |
| ----------- | ----------------- | ----------- | ------------------------------------------------------ |
| `date`      | string (ISO 8601) | Sim         | Data para buscar horários disponíveis (ex: 2025-12-10) |
| `serviceId` | UUID              | Sim         | ID do serviço a ser agendado                           |

### Características

- ✅ **Endpoint Público**: Não requer autenticação
- ✅ **Dinâmico**: Baseado nas configurações do sistema
- ✅ **Inteligente**: Considera conflitos e regras de negócio
- ✅ **Rápido**: Otimizado para consulta em tempo real

## Exemplo de Uso

### Request

```bash
curl -X GET "http://localhost:3000/appointments/available-slots/search?date=2025-12-10&serviceId=550e8400-e29b-41d4-a716-446655440000"
```

### Response Sucesso (200)

```json
{
  "slots": [
    "2025-12-10T11:00:00.000Z",
    "2025-12-10T11:15:00.000Z",
    "2025-12-10T11:30:00.000Z",
    "2025-12-10T11:45:00.000Z",
    "2025-12-10T12:00:00.000Z",
    "2025-12-10T14:00:00.000Z",
    "2025-12-10T14:15:00.000Z",
    "2025-12-10T14:30:00.000Z",
    "2025-12-10T15:00:00.000Z",
    "2025-12-10T16:00:00.000Z",
    "2025-12-10T16:30:00.000Z",
    "2025-12-10T17:00:00.000Z"
  ],
  "businessHours": {
    "openTime": "08:00",
    "closeTime": "18:00"
  }
}
```

### Response Erro - Dia não útil (400)

```json
{
  "statusCode": 400,
  "message": "Domingo não é um dia útil. Dias de funcionamento: Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado",
  "error": "Bad Request"
}
```

### Response Erro - Serviço não encontrado (404)

```json
{
  "statusCode": 404,
  "message": "Serviço com ID 550e8400-e29b-41d4-a716-446655440000 não encontrado",
  "error": "Not Found"
}
```

## Lógica de Funcionamento

### 1. Validações Iniciais

- Verifica se o serviço existe
- Verifica se a data é um dia útil
- Valida formato da data

### 2. Geração de Slots

```typescript
// Baseado nas configurações
const openTime = "08:00"; // Configuração
const closeTime = "18:00"; // Configuração
const slotInterval = 15; // Configuração (minutos)
const serviceDuration = 30; // Do serviço selecionado

// Gera slots de 15 em 15 minutos entre 08:00 e 18:00
// Mas só inclui slots onde o serviço completo cabe antes do closeTime
```

### 3. Filtragem de Conflitos

Para cada slot gerado, verifica:

```typescript
// ❌ Excluído se:
- Há agendamento existente que sobrepõe o horário
- Não respeita antecedência mínima (ex: 2 horas)
- Serviço terminaria após o horário de fechamento

// ✅ Incluído se:
- Não há conflitos
- Respeita todas as regras de negócio
- Está dentro do horário comercial
```

## Exemplos de Cenários

### Cenário 1: Dia com Poucos Agendamentos

**Serviço**: Corte Simples (30 minutos)  
**Agendamentos existentes**: 10:00-10:30, 14:00-14:30

**Slots disponíveis**:

```
08:00, 08:15, 08:30, 08:45, 09:00, 09:15, 09:30, 09:45,
10:45, 11:00, 11:15, 11:30, 11:45, 12:00, 12:15, 12:30, 12:45, 13:00, 13:15, 13:30,
15:00, 15:15, 15:30, 15:45, 16:00, 16:15, 16:30, 17:00, 17:15
```

### Cenário 2: Serviço Longo

**Serviço**: Corte + Barba (60 minutos)  
**Horário comercial**: 08:00 - 18:00

**Último slot possível**: 17:00 (pois termina às 18:00)

### Cenário 3: Alta Demanda

**Serviço**: Corte Simples (30 minutos)  
**Agendamentos**: A cada hora

**Slots disponíveis**: Apenas os intervalos de 15 minutos entre agendamentos (se couber o serviço)

### Cenário 4: Antecedência Mínima

**Hora atual**: 10:00  
**Antecedência mínima**: 2 horas  
**Data consultada**: Hoje

**Resultado**: Só mostra slots a partir de 12:00

## Integração com Frontend

### Exemplo React/TypeScript

```typescript
interface AvailableSlot {
  slots: string[];
  businessHours: {
    openTime: string;
    closeTime: string;
  };
}

async function fetchAvailableSlots(
  date: string,
  serviceId: string,
): Promise<AvailableSlot> {
  const response = await fetch(
    `/api/appointments/available-slots/search?date=${date}&serviceId=${serviceId}`,
  );

  if (!response.ok) {
    throw new Error("Falha ao buscar horários disponíveis");
  }

  return response.json();
}

// Uso
const slots = await fetchAvailableSlots("2025-12-10", "service-uuid");

// Renderizar slots
slots.slots.forEach((slot) => {
  const date = new Date(slot);
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log(time); // "11:00", "11:15", etc.
});
```

### Exemplo de UI

```jsx
function TimeSlotPicker({ date, serviceId }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAvailableSlots(date, serviceId)
      .then((data) => setSlots(data.slots))
      .finally(() => setLoading(false));
  }, [date, serviceId]);

  return (
    <div className="time-slots">
      <h3>Horários Disponíveis</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : slots.length === 0 ? (
        <p>Nenhum horário disponível nesta data</p>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => (
            <button key={slot} onClick={() => selectSlot(slot)}>
              {new Date(slot).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Performance

### Otimizações Implementadas

1. **Query única**: Busca todos os agendamentos do dia em uma query
2. **Algoritmo eficiente**: O(n\*m) onde n=slots possíveis, m=agendamentos existentes
3. **Índices do banco**: `@@index([startsAt, endsAt])` no modelo Appointment
4. **Cache de settings**: Configurações cacheadas por 1 minuto

### Estimativa de Performance

- **Cenário médio**: ~50ms (10 agendamentos no dia)
- **Pior caso**: ~200ms (100 agendamentos no dia)
- **Melhor caso**: ~20ms (sem agendamentos)

## Considerações de Negócio

### Horários Indisponíveis

Um slot não aparece se:

- Já existe agendamento naquele horário
- Não respeita antecedência mínima
- O serviço não caberia antes do fechamento
- É um dia não útil

### Múltiplos Barbeiros (Futuro)

Atualmente o sistema considera apenas um barbeiro. Para múltiplos barbeiros:

```typescript
// Implementação futura
const availableBarbersCount = 3;
const slotsPerBarbeiro = generateSlots();
// Replicar slots pelo número de barbeiros
```

## Testes

### Teste Manual

```bash
# 1. Obter ID de um serviço
curl http://localhost:3000/services | jq '.[0].id'

# 2. Buscar slots para hoje
curl "http://localhost:3000/appointments/available-slots/search?date=$(date -I)&serviceId={ID_DO_SERVICO}"

# 3. Testar dia não útil (Domingo)
curl "http://localhost:3000/appointments/available-slots/search?date=2025-12-14&serviceId={ID_DO_SERVICO}"

# 4. Criar agendamento e verificar que slot sumiu
curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "startsAt": "2025-12-10T10:00:00.000Z",
    "serviceId": "{ID_DO_SERVICO}",
    "clientName": "João"
  }'

# 5. Buscar novamente e verificar que 10:00 não aparece mais
curl "http://localhost:3000/appointments/available-slots/search?date=2025-12-10&serviceId={ID_DO_SERVICO}"
```

## Arquivos Relacionados

- **Controller**: `src/modules/appointment/appointment.controller.ts`
- **Service**: `src/modules/appointment/appointment.service.ts`
- **DTO**: `src/modules/appointment/dto/get-available-slots.dto.ts`
- **Settings**: `src/modules/settings/settings.service.ts`

## Melhorias Futuras

1. ☐ Cache de slots para datas futuras (Redis)
2. ☐ Suporte a múltiplos barbeiros
3. ☐ Slots favoritos/recomendados
4. ☐ Notificação quando slot fica disponível
5. ☐ Horários especiais (feriados, eventos)
6. ☐ Buffer entre atendimentos configurável
