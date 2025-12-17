# Exemplos de Uso - Histórico do Cliente

## Cenários de Teste

### Setup Inicial

Certifique-se de ter:

1. Backend rodando na porta 3000
2. Token JWT válido de um usuário ADMIN ou BARBER
3. Alguns agendamentos cadastrados no sistema

## 1. Buscar Cliente por Nome Completo

### Request

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=João Silva&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response Esperada

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "startsAt": "2025-01-15T14:00:00.000Z",
      "endsAt": "2025-01-15T15:00:00.000Z",
      "status": "COMPLETED",
      "user": {
        "name": "João Silva",
        "email": "joao.silva@email.com",
        "phone": "11987654321"
      },
      "service": {
        "name": "Corte Degradê",
        "price": "50.00",
        "durationMin": 60
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 2. Buscar Cliente por Nome Parcial (Case-Insensitive)

### Request

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=joão" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Resultado**: Encontrará "João Silva", "João Pedro", "Maria João", etc.

---

## 3. Buscar Cliente por Telefone

### Request

```bash
curl -X GET "http://localhost:3000/appointments/client-history?phone=11987654321" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## 4. Buscar com Paginação

### Request - Página 1

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=Maria&page=1&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Request - Página 2

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=Maria&page=2&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## 5. Busca Combinada (Nome + Telefone)

### Request

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=João&phone=11987654321" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Resultado**: Busca mais específica, útil quando há vários clientes com nomes similares.

---

## Erros Comuns

### 1. Nenhum Parâmetro Fornecido

**Request:**

```bash
curl -X GET "http://localhost:3000/appointments/client-history" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "statusCode": 400,
  "message": "É necessário fornecer pelo menos o nome ou telefone do cliente para buscar o histórico",
  "error": "Bad Request"
}
```

### 2. Sem Token de Autenticação

**Request:**

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=João"
```

**Response:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 3. Usuário Sem Permissão (CLIENT)

**Request com token de usuário CLIENT:**

```bash
curl -X GET "http://localhost:3000/appointments/client-history?clientName=João" \
  -H "Authorization: Bearer TOKEN_DE_CLIENTE"
```

**Response:**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Código JavaScript/TypeScript

### Exemplo com Fetch API

```typescript
interface ClientHistoryParams {
  clientName?: string;
  phone?: string;
  page?: number;
  limit?: number;
}

async function getClientHistory(params: ClientHistoryParams, token: string) {
  const searchParams = new URLSearchParams();

  if (params.clientName) searchParams.append("clientName", params.clientName);
  if (params.phone) searchParams.append("phone", params.phone);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  const response = await fetch(
    `http://localhost:3000/appointments/client-history?${searchParams}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Uso
try {
  const history = await getClientHistory(
    { clientName: "João", page: 1, limit: 10 },
    "SEU_TOKEN_JWT",
  );

  console.log(`Total de agendamentos: ${history.meta.total}`);
  console.log("Agendamentos:", history.data);
} catch (error) {
  console.error("Erro:", error.message);
}
```

### Exemplo com Axios

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function getClientHistory(
  clientName?: string,
  phone?: string,
  page = 1,
  limit = 10,
) {
  try {
    const response = await api.get("/appointments/client-history", {
      params: { clientName, phone, page, limit },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Erro ao buscar histórico",
      );
    }
    throw error;
  }
}

// Uso
const history = await getClientHistory("João Silva");
console.log(history);
```

---

## Teste com Postman

### Setup

1. **URL**: `GET http://localhost:3000/appointments/client-history`

2. **Headers**:
   - `Authorization`: `Bearer SEU_TOKEN_JWT`
   - `Content-Type`: `application/json`

3. **Query Params**:
   - `clientName`: João Silva
   - `page`: 1
   - `limit`: 10

### Collection Postman (JSON)

```json
{
  "info": {
    "name": "Barber Boss - Client History",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Client History by Name",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/appointments/client-history?clientName=João Silva&page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["appointments", "client-history"],
          "query": [
            { "key": "clientName", "value": "João Silva" },
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "10" }
          ]
        }
      }
    },
    {
      "name": "Get Client History by Phone",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/appointments/client-history?phone=11987654321&page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["appointments", "client-history"],
          "query": [
            { "key": "phone", "value": "11987654321" },
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "10" }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": "SEU_TOKEN_JWT_AQUI"
    }
  ]
}
```

---

## Análise de Resposta

### Campos Importantes

```typescript
interface ClientHistoryResponse {
  data: Appointment[];
  meta: {
    total: number; // Total de agendamentos encontrados
    page: number; // Página atual
    limit: number; // Itens por página
    totalPages: number; // Total de páginas
  };
}

interface Appointment {
  id: string;
  startsAt: string; // ISO 8601 format
  endsAt: string; // ISO 8601 format
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "COMPLETED" | "NO_SHOW";
  userId: string | null;
  clientName: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  service: {
    id: string;
    name: string;
    price: string;
    durationMin: number;
  };
}
```

### Exibindo Resultados

```typescript
function displayClientHistory(response: ClientHistoryResponse) {
  console.log(`\n=== Histórico do Cliente ===`);
  console.log(`Total de agendamentos: ${response.meta.total}`);
  console.log(`Página ${response.meta.page} de ${response.meta.totalPages}\n`);

  response.data.forEach((appointment, index) => {
    const clientName =
      appointment.user?.name ||
      appointment.clientName ||
      "Cliente não identificado";
    const phone = appointment.user?.phone || "Telefone não disponível";
    const date = new Date(appointment.startsAt).toLocaleDateString("pt-BR");
    const time = new Date(appointment.startsAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log(`${index + 1}. ${clientName}`);
    console.log(`   📞 ${phone}`);
    console.log(`   📅 ${date} às ${time}`);
    console.log(
      `   ✂️  ${appointment.service.name} (R$ ${appointment.service.price})`,
    );
    console.log(`   📊 Status: ${appointment.status}`);
    console.log("");
  });
}
```

---

## Dicas de Performance

1. **Use paginação adequada**: Limite pequeno (5-20) para melhor performance
2. **Busque por telefone quando possível**: Mais específico que nome
3. **Implemente cache no frontend**: Armazene resultados recentes
4. **Debounce em buscas**: Aguarde o usuário parar de digitar antes de buscar

```typescript
// Exemplo de debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Uso
const debouncedSearch = debounce(
  (name: string) => getClientHistory({ clientName: name }),
  500,
);

// Chamar ao digitar
input.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});
```
