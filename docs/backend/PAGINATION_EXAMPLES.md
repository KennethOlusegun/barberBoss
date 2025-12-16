# Exemplos de Uso da API com Paginação

Este arquivo contém exemplos práticos de como usar os endpoints paginados da API.

## Base URL

```
http://localhost:3000
```

## 1. Usuários

### Listar todos os usuários (página 1, padrão)

```bash
curl http://localhost:3000/users
```

### Listar usuários com paginação personalizada

```bash
# Página 2 com 20 itens
curl "http://localhost:3000/users?page=2&limit=20"

# Primeira página com 5 itens
curl "http://localhost:3000/users?page=1&limit=5"
```

### Buscar usuário específico por ID

```bash
curl http://localhost:3000/users/{uuid}
```

## 2. Serviços

### Listar todos os serviços ativos (página 1, padrão)

```bash
curl http://localhost:3000/services
```

### Listar serviços com paginação personalizada

```bash
# Página 1 com 15 itens
curl "http://localhost:3000/services?page=1&limit=15"

# Página 3 com 10 itens
curl "http://localhost:3000/services?page=3&limit=10"
```

### Buscar serviço específico por ID

```bash
curl http://localhost:3000/services/{uuid}
```

## 3. Agendamentos

### Listar todos os agendamentos (página 1, padrão)

```bash
curl http://localhost:3000/appointments
```

### Listar agendamentos com paginação

```bash
# Página 2 com 15 itens
curl "http://localhost:3000/appointments?page=2&limit=15"
```

### Filtrar agendamentos por data com paginação

```bash
# Agendamentos do dia 15/01/2024
curl "http://localhost:3000/appointments?date=2024-01-15&page=1&limit=20"

# Agendamentos de hoje
curl "http://localhost:3000/appointments?date=$(date -I)&page=1&limit=10"
```

### Filtrar agendamentos por usuário com paginação

```bash
# Todos os agendamentos de um usuário específico
curl "http://localhost:3000/appointments?userId={uuid}&page=1&limit=10"

# Segunda página dos agendamentos do usuário
curl "http://localhost:3000/appointments?userId={uuid}&page=2&limit=10"
```

### Filtrar agendamentos por status com paginação

```bash
# Agendamentos confirmados
curl "http://localhost:3000/appointments?status=CONFIRMED&page=1&limit=20"

# Agendamentos cancelados
curl "http://localhost:3000/appointments?status=CANCELED&page=1&limit=10"

# Agendamentos completados
curl "http://localhost:3000/appointments?status=COMPLETED&page=1&limit=15"
```

### Buscar agendamento específico por ID

```bash
curl http://localhost:3000/appointments/{uuid}
```

## 4. Exemplos com JavaScript/Fetch

### Função genérica para buscar dados paginados

```javascript
async function fetchPaginated(endpoint, page = 1, limit = 10, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  const response = await fetch(`http://localhost:3000/${endpoint}?${params}`);
  return await response.json();
}

// Usar a função
const users = await fetchPaginated("users", 1, 20);
const services = await fetchPaginated("services", 2, 15);
const appointments = await fetchPaginated("appointments", 1, 10, {
  date: "2024-01-15",
});
```

### Navegar entre páginas

```javascript
class PaginationHelper {
  constructor(endpoint, limit = 10) {
    this.endpoint = endpoint;
    this.limit = limit;
    this.currentPage = 1;
    this.meta = null;
  }

  async fetch(page = this.currentPage) {
    const response = await fetch(
      `http://localhost:3000/${this.endpoint}?page=${page}&limit=${this.limit}`,
    );
    const data = await response.json();

    this.currentPage = data.meta.currentPage;
    this.meta = data.meta;

    return data;
  }

  async next() {
    if (this.meta?.hasNextPage) {
      return await this.fetch(this.currentPage + 1);
    }
    return null;
  }

  async previous() {
    if (this.meta?.hasPreviousPage) {
      return await this.fetch(this.currentPage - 1);
    }
    return null;
  }

  async goToPage(page) {
    return await this.fetch(page);
  }
}

// Usar o helper
const usersPagination = new PaginationHelper("users", 20);

// Buscar primeira página
const firstPage = await usersPagination.fetch();
console.log(firstPage.data);
console.log(firstPage.meta);

// Próxima página
const secondPage = await usersPagination.next();

// Voltar
const backToFirst = await usersPagination.previous();
```

## 5. Exemplos com React

### Hook personalizado para paginação

```javascript
import { useState, useEffect } from "react";

function usePagination(endpoint, limit = 10, filters = {}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          ...filters,
        });

        const response = await fetch(
          `http://localhost:3000/${endpoint}?${params}`,
        );

        if (!response.ok) throw new Error("Erro ao buscar dados");

        const result = await response.json();
        setData(result.data);
        setMeta(result.meta);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, currentPage, limit, JSON.stringify(filters)]);

  const nextPage = () => {
    if (meta?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (meta?.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return {
    data,
    meta,
    loading,
    error,
    currentPage,
    nextPage,
    previousPage,
    goToPage,
  };
}

// Usar o hook
function UsersList() {
  const {
    data: users,
    meta,
    loading,
    error,
    nextPage,
    previousPage,
  } = usePagination("users", 20);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={previousPage} disabled={!meta?.hasPreviousPage}>
          Anterior
        </button>

        <span>
          Página {meta?.currentPage} de {meta?.totalPages}
        </span>

        <button onClick={nextPage} disabled={!meta?.hasNextPage}>
          Próxima
        </button>
      </div>

      <div className="info">
        Mostrando {users.length} de {meta?.totalItems} itens
      </div>
    </div>
  );
}
```

## 6. Testando com Postman

### Coleção de requisições

1. **GET Users - Página 1**
   - URL: `http://localhost:3000/users?page=1&limit=10`
   - Método: GET

2. **GET Users - Página 2**
   - URL: `http://localhost:3000/users?page=2&limit=10`
   - Método: GET

3. **GET Services - Customizado**
   - URL: `http://localhost:3000/services?page=1&limit=15`
   - Método: GET

4. **GET Appointments - Por Data**
   - URL: `http://localhost:3000/appointments?date=2024-01-15&page=1&limit=20`
   - Método: GET

5. **GET Appointments - Por Usuário**
   - URL: `http://localhost:3000/appointments?userId={uuid}&page=1&limit=10`
   - Método: GET

## 7. Respostas Esperadas

### Resposta de Sucesso (200 OK)

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

### Resposta com Validação de Erro (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": [
    "page must not be less than 1",
    "limit must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

## 8. Dicas de Performance

1. **Cache no Frontend**: Considere cachear páginas já visitadas
2. **Prefetch**: Carregue a próxima página em background
3. **Debounce**: Use debounce para filtros de busca
4. **Virtual Scrolling**: Para listas muito longas, considere scroll virtual
5. **Limite Apropriado**: Ajuste o limite baseado no caso de uso
   - Listas pequenas: 10-20 itens
   - Tabelas: 25-50 itens
   - Dropdowns: 50-100 itens
