# Histórico do Cliente por Nome/Telefone

## Visão Geral

Este recurso permite buscar o histórico completo de agendamentos de um cliente utilizando seu nome ou telefone. É especialmente útil para:

- Verificar histórico de atendimentos de um cliente
- Identificar padrões de agendamento
- Consultar serviços anteriormente realizados
- Facilitar o atendimento personalizado

## Endpoint

```
GET /appointments/client-history
```

### Autenticação

🔒 **Requer autenticação**: Sim (Bearer Token)  
👥 **Permissões**: ADMIN, BARBER

## Parâmetros de Query

| Parâmetro    | Tipo   | Obrigatório   | Descrição                                         |
| ------------ | ------ | ------------- | ------------------------------------------------- |
| `clientName` | string | Condicional\* | Nome do cliente (busca parcial, case-insensitive) |
| `phone`      | string | Condicional\* | Telefone do cliente                               |
| `page`       | number | Não           | Número da página (padrão: 1)                      |
| `limit`      | number | Não           | Itens por página (padrão: 10)                     |

\* **Pelo menos um dos parâmetros** (`clientName` ou `phone`) **deve ser fornecido**.

## Exemplos de Uso

### 1. Buscar por Nome Completo

```bash
GET /appointments/client-history?clientName=João Silva&page=1&limit=10
```

### 2. Buscar por Nome Parcial

```bash
GET /appointments/client-history?clientName=João
```

### 3. Buscar por Telefone

```bash
GET /appointments/client-history?phone=11987654321
```

### 4. Buscar por Nome e Telefone (busca mais específica)

```bash
GET /appointments/client-history?clientName=João&phone=11987654321
```

## Resposta de Sucesso

**Status Code:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "startsAt": "2025-01-15T14:00:00.000Z",
      "endsAt": "2025-01-15T15:00:00.000Z",
      "status": "COMPLETED",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "clientName": null,
      "serviceId": "789e0123-e89b-12d3-a456-426614174000",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-15T15:00:00.000Z",
      "service": {
        "id": "789e0123-e89b-12d3-a456-426614174000",
        "name": "Corte Degradê",
        "price": "50.00",
        "durationMin": 60
      },
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "11987654321"
      }
    },
    {
      "id": "660e9511-f30c-52e5-b827-557766551111",
      "startsAt": "2025-01-08T10:00:00.000Z",
      "endsAt": "2025-01-08T10:30:00.000Z",
      "status": "COMPLETED",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "clientName": null,
      "serviceId": "890f1234-f90c-23e4-b567-537725285111",
      "createdAt": "2025-01-05T09:00:00.000Z",
      "updatedAt": "2025-01-08T10:30:00.000Z",
      "service": {
        "id": "890f1234-f90c-23e4-b567-537725285111",
        "name": "Barba Completa",
        "price": "35.00",
        "durationMin": 30
      },
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "11987654321"
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Respostas de Erro

### 400 - Bad Request (Parâmetros não fornecidos)

```json
{
  "statusCode": 400,
  "message": "É necessário fornecer pelo menos o nome ou telefone do cliente para buscar o histórico",
  "error": "Bad Request"
}
```

### 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 - Forbidden (Sem permissão)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

## Funcionalidades

### 1. Busca Parcial de Nome

A busca por nome é **case-insensitive** e aceita **correspondências parciais**:

- `clientName=João` encontrará: "João Silva", "João Pedro", "Maria João"
- `clientName=silva` encontrará: "João Silva", "Pedro Silva"

### 2. Busca em Múltiplas Fontes

A busca por nome verifica:

- Campo `clientName` do agendamento (para clientes sem cadastro)
- Campo `user.name` (para clientes cadastrados no sistema)

### 3. Busca por Telefone

A busca por telefone verifica apenas clientes cadastrados (`user.phone`).

### 4. Ordenação

Os resultados são retornados **do mais recente para o mais antigo** (`startsAt DESC`).

### 5. Paginação

- Padrão: 10 itens por página
- Personalizável via parâmetros `page` e `limit`
- Retorna metadados de paginação (`total`, `totalPages`, etc.)

## Exemplos de Integração

### JavaScript/TypeScript (Fetch)

```typescript
async function getClientHistory(clientName: string, page = 1, limit = 10) {
  const params = new URLSearchParams({
    clientName,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `http://localhost:3000/appointments/client-history?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar histórico do cliente");
  }

  return await response.json();
}

// Uso
const history = await getClientHistory("João Silva", 1, 20);
console.log(`Total de agendamentos: ${history.meta.total}`);
```

### cURL

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=João&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

## Casos de Uso

### 1. Verificar Histórico Completo de um Cliente

```
GET /appointments/client-history?clientName=Maria Santos
```

Útil para: Revisar todos os serviços realizados para um cliente específico.

### 2. Localizar Cliente por Telefone

```
GET /appointments/client-history?phone=11987654321
```

Útil para: Quando o barbeiro só tem o telefone do cliente.

### 3. Busca Combinada

```
GET /appointments/client-history?clientName=João&phone=119876
```

Útil para: Busca mais precisa quando há clientes com nomes similares.

## Observações Importantes

1. **Permissões**: Apenas ADMIN e BARBER podem acessar este endpoint
2. **Autenticação**: Requer token JWT válido
3. **Performance**: A busca utiliza índices no banco de dados para melhor desempenho
4. **Dados Sensíveis**: O endpoint retorna informações do cliente, incluindo email e telefone
5. **Clientes sem Cadastro**: Agendamentos feitos manualmente (com apenas `clientName`) também são incluídos na busca por nome

## Estrutura de Dados Retornada

### Appointment

| Campo        | Tipo                  | Descrição                                                                |
| ------------ | --------------------- | ------------------------------------------------------------------------ |
| `id`         | string (UUID)         | ID único do agendamento                                                  |
| `startsAt`   | DateTime (ISO 8601)   | Data/hora de início                                                      |
| `endsAt`     | DateTime (ISO 8601)   | Data/hora de término                                                     |
| `status`     | enum                  | Status do agendamento (PENDING, CONFIRMED, CANCELED, COMPLETED, NO_SHOW) |
| `userId`     | string (UUID) \| null | ID do usuário cadastrado (se aplicável)                                  |
| `clientName` | string \| null        | Nome do cliente (para agendamentos manuais)                              |
| `service`    | object                | Detalhes do serviço realizado                                            |
| `user`       | object \| null        | Dados do cliente (se cadastrado)                                         |

### Service (nested)

| Campo         | Tipo          | Descrição          |
| ------------- | ------------- | ------------------ |
| `id`          | string (UUID) | ID do serviço      |
| `name`        | string        | Nome do serviço    |
| `price`       | Decimal       | Preço do serviço   |
| `durationMin` | number        | Duração em minutos |

### User (nested)

| Campo   | Tipo           | Descrição     |
| ------- | -------------- | ------------- |
| `id`    | string (UUID)  | ID do usuário |
| `name`  | string         | Nome completo |
| `email` | string         | Email         |
| `phone` | string \| null | Telefone      |

## Próximas Melhorias Sugeridas

1. **Filtro por Status**: Permitir filtrar por status específico (ex: apenas COMPLETED)
2. **Filtro por Período**: Buscar agendamentos em um intervalo de datas
3. **Estatísticas**: Adicionar resumo de gastos totais, serviço mais frequente, etc.
4. **Export**: Permitir exportar histórico em PDF ou Excel
5. **Cache**: Implementar cache para buscas frequentes
