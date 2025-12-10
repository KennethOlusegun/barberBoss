# Paginação nos Endpoints

## Visão Geral

A paginação foi implementada nos principais endpoints de listagem da API para melhorar a performance e a experiência do usuário ao lidar com grandes volumes de dados.

## Estrutura da Resposta Paginada

Todas as respostas paginadas seguem a seguinte estrutura:

```json
{
  "data": [...],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

### Campos da Resposta

- **data**: Array com os itens da página atual
- **meta**: Objeto com metadados de paginação
  - **currentPage**: Número da página atual
  - **itemsPerPage**: Quantidade de itens por página
  - **totalItems**: Total de itens disponíveis
  - **totalPages**: Total de páginas
  - **hasPreviousPage**: Indica se há página anterior
  - **hasNextPage**: Indica se há próxima página

## Parâmetros de Paginação

| Parâmetro | Tipo   | Obrigatório | Padrão | Descrição                          |
|-----------|--------|-------------|--------|------------------------------------|
| page      | number | Não         | 1      | Número da página (começa em 1)     |
| limit     | number | Não         | 10     | Itens por página (máx: 100)        |

## Endpoints com Paginação

### 1. Listar Usuários

```
GET /users?page=1&limit=10
```

**Exemplo de Requisição:**
```bash
curl http://localhost:3000/users?page=2&limit=20
```

**Exemplo de Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "currentPage": 2,
    "itemsPerPage": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasPreviousPage": true,
    "hasNextPage": true
  }
}
```

### 2. Listar Serviços

```
GET /services?page=1&limit=10
```

**Exemplo de Requisição:**
```bash
curl http://localhost:3000/services?page=1&limit=15
```

**Exemplo de Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Corte de Cabelo",
      "description": "Corte masculino tradicional",
      "price": 30.00,
      "durationMin": 30,
      "active": true
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 15,
    "totalItems": 25,
    "totalPages": 2,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

### 3. Listar Agendamentos

```
GET /appointments?page=1&limit=10
```

O endpoint de agendamentos também suporta filtros combinados com paginação:

**Filtros Disponíveis:**
- `date`: Filtrar por data específica (ISO 8601)
- `userId`: Filtrar por UUID do usuário
- `status`: Filtrar por status do agendamento

**Exemplo com Filtros:**
```bash
# Listar agendamentos de uma data específica com paginação
curl "http://localhost:3000/appointments?date=2024-01-15&page=1&limit=20"

# Listar agendamentos de um usuário com paginação
curl "http://localhost:3000/appointments?userId=uuid-do-usuario&page=1&limit=10"

# Listar agendamentos por status com paginação
curl "http://localhost:3000/appointments?status=CONFIRMED&page=2&limit=15"
```

**Exemplo de Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "startsAt": "2024-01-15T10:00:00Z",
      "endsAt": "2024-01-15T10:30:00Z",
      "status": "CONFIRMED",
      "clientName": "Maria Santos",
      "user": {
        "id": "uuid",
        "name": "Maria Santos",
        "email": "maria@example.com"
      },
      "service": {
        "id": "uuid",
        "name": "Corte de Cabelo",
        "price": 30.00
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 20,
    "totalItems": 8,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

## Validação

Os parâmetros de paginação são validados automaticamente:

- **page**: Deve ser um número inteiro maior ou igual a 1
- **limit**: Deve ser um número inteiro entre 1 e 100

Se valores inválidos forem fornecidos, a API retornará um erro 400 com detalhes da validação.

## Navegação entre Páginas

Para navegar entre páginas, use os metadados da resposta:

```javascript
// Frontend exemplo
function nextPage(currentMeta) {
  if (currentMeta.hasNextPage) {
    const nextPage = currentMeta.currentPage + 1;
    return fetch(`/users?page=${nextPage}&limit=${currentMeta.itemsPerPage}`);
  }
}

function previousPage(currentMeta) {
  if (currentMeta.hasPreviousPage) {
    const prevPage = currentMeta.currentPage - 1;
    return fetch(`/users?page=${prevPage}&limit=${currentMeta.itemsPerPage}`);
  }
}
```

## Boas Práticas

1. **Escolha o tamanho da página apropriado**: Para listas, 10-20 itens costumam ser ideais. Para dropdowns ou seletores, considere 50-100.

2. **Cache de páginas**: Considere cachear páginas já visitadas no frontend para melhorar a experiência do usuário.

3. **Deep linking**: Inclua os parâmetros de paginação na URL para permitir compartilhamento e bookmarks.

4. **Loading states**: Sempre mostre um indicador de carregamento durante a navegação entre páginas.

5. **Limite máximo**: O limite máximo de 100 itens por página foi definido para proteger a performance do servidor.

## Swagger/OpenAPI

A documentação da API no Swagger foi atualizada para incluir os parâmetros de paginação. Acesse:

```
http://localhost:3000/api
```

Todos os endpoints paginados incluem exemplos e descrições dos parâmetros disponíveis.
