# Exception Filters Globais

## Visão Geral

Este documento descreve os **Exception Filters Globais** implementados na API Barber Boss. Os filtros de exceção são responsáveis por capturar e formatar erros de forma consistente em toda a aplicação.

## Arquitetura

A aplicação possui três filtros principais que trabalham em conjunto:

```
AllExceptionsFilter (captura tudo)
    └── PrismaExceptionFilter (erros do Prisma)
        └── HttpExceptionFilter (HttpExceptions do NestJS)
```

### 1. AllExceptionsFilter

**Arquivo:** `src/common/filters/all-exceptions.filter.ts`

**Responsabilidade:** Captura todas as exceções não tratadas pelos outros filtros, garantindo que nenhum erro chegue ao cliente sem formatação adequada.

**Decorador:** `@Catch()` (sem parâmetros = captura tudo)

**Formato de Resposta:**

```json
{
  "statusCode": 500,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST",
  "message": "Descrição do erro",
  "error": "Internal Server Error"
}
```

**Casos de Uso:**

- Erros inesperados de runtime
- Exceções não classificadas
- Erros de terceiros não mapeados

### 2. PrismaExceptionFilter

**Arquivo:** `src/common/filters/prisma-exception.filter.ts`

**Responsabilidade:** Captura e traduz erros do Prisma ORM para mensagens amigáveis em português.

**Decorador:** `@Catch(Prisma.PrismaClientKnownRequestError)`

#### Códigos de Erro Tratados

| Código | Descrição                           | Status HTTP               | Mensagem                                                          |
| ------ | ----------------------------------- | ------------------------- | ----------------------------------------------------------------- |
| P2002  | Violação de constraint única        | 409 Conflict              | "Já existe um registro com este(s) valor(es): {campos}"           |
| P2025  | Registro não encontrado             | 404 Not Found             | "Registro não encontrado"                                         |
| P2003  | Violação de chave estrangeira       | 400 Bad Request           | "Violação de chave estrangeira - registro relacionado não existe" |
| P2014  | Violação de relação obrigatória     | 400 Bad Request           | "A operação viola uma relação obrigatória"                        |
| P2021  | Tabela não existe                   | 500 Internal Server Error | "Erro de configuração do banco de dados"                          |
| P2022  | Coluna não existe                   | 500 Internal Server Error | "Erro de configuração do banco de dados"                          |
| P2000  | Valor muito longo                   | 400 Bad Request           | "Valor muito longo para o campo"                                  |
| P2001  | Registro não encontrado na condição | 404 Not Found             | "Registro não encontrado para a condição especificada"            |
| P2011  | Violação de constraint NOT NULL     | 400 Bad Request           | "Campo obrigatório não pode ser nulo"                             |
| P2012  | Valor obrigatório ausente           | 400 Bad Request           | "Valor obrigatório ausente"                                       |
| P2015  | Registro relacionado não encontrado | 404 Not Found             | "Registro relacionado não encontrado"                             |

**Formato de Resposta:**

```json
{
  "statusCode": 409,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": "Já existe um registro com este(s) valor(es): email",
  "error": "Unique Constraint Violation",
  "code": "P2002"
}
```

### 3. HttpExceptionFilter

**Arquivo:** `src/common/filters/http-exception.filter.ts`

**Responsabilidade:** Captura exceções HTTP do NestJS (como `BadRequestException`, `NotFoundException`, etc.) e formata suas respostas.

**Decorador:** `@Catch(HttpException)`

**Formato de Resposta:**

```json
{
  "statusCode": 404,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/users/123",
  "method": "GET",
  "message": "Usuário não encontrado",
  "error": "Not Found"
}
```

**Exceções Capturadas:**

- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `InternalServerErrorException` (500)
- E outras exceções HTTP do NestJS

## Registro no Bootstrap

Os filtros são registrados no `main.ts` na seguinte ordem:

```typescript
app.useGlobalFilters(
  new AllExceptionsFilter(), // 1. Captura tudo
  new PrismaExceptionFilter(), // 2. Captura erros Prisma
  new HttpExceptionFilter(), // 3. Captura HttpExceptions
);
```

**Ordem de Execução:**

1. NestJS tenta encontrar o filtro mais específico primeiro
2. Se o erro for do Prisma → `PrismaExceptionFilter`
3. Se for uma HttpException → `HttpExceptionFilter`
4. Caso contrário → `AllExceptionsFilter`

## Logging

Todos os filtros fazem logging detalhado dos erros incluindo:

- **Contexto da Requisição:** método HTTP, URL, corpo da requisição
- **Usuário:** ID do usuário autenticado (quando disponível)
- **Stack Trace:** para erros não HTTP (apenas no AllExceptionsFilter)
- **Metadados:** informações adicionais do Prisma (PrismaExceptionFilter)

**Exemplo de Log:**

```
[HttpExceptionFilter] ERROR: HTTP Exception: POST /api/appointments
{
  "statusCode": 400,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/appointments",
  "method": "POST",
  "message": "Horário não disponível",
  "error": "Bad Request",
  "user": "uuid-do-usuario",
  "body": { "date": "2025-12-10", "time": "10:00" }
}
```

## Exemplos de Uso

### Exemplo 1: Erro de Validação (HttpException)

**Request:**

```http
POST /api/users
Content-Type: application/json

{
  "email": "email-invalido"
}
```

**Response:**

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### Exemplo 2: Email Duplicado (Prisma P2002)

**Request:**

```http
POST /api/users
Content-Type: application/json

{
  "email": "existente@email.com",
  "name": "Teste",
  "password": "123456"
}
```

**Response:**

```json
{
  "statusCode": 409,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": "Já existe um registro com este(s) valor(es): email",
  "error": "Unique Constraint Violation",
  "code": "P2002"
}
```

### Exemplo 3: Registro Não Encontrado (Prisma P2025)

**Request:**

```http
DELETE /api/appointments/uuid-inexistente
```

**Response:**

```json
{
  "statusCode": 404,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/appointments/uuid-inexistente",
  "method": "DELETE",
  "message": "Registro não encontrado",
  "error": "Record Not Found",
  "code": "P2025"
}
```

### Exemplo 4: Erro Interno (AllExceptionsFilter)

**Request:**

```http
GET /api/endpoint-com-erro
```

**Response:**

```json
{
  "statusCode": 500,
  "timestamp": "2025-12-09T12:00:00.000Z",
  "path": "/api/endpoint-com-erro",
  "method": "GET",
  "message": "Cannot read property of undefined",
  "error": "TypeError"
}
```

## Boas Práticas

### 1. Nos Controllers/Services

Use as exceções HTTP do NestJS para erros de negócio:

```typescript
// ❌ Evite
throw new Error("Usuário não encontrado");

// ✅ Correto
throw new NotFoundException("Usuário não encontrado");

// ✅ Também correto para erros de validação customizados
throw new BadRequestException("Horário não disponível para agendamento");
```

### 2. Deixe o Prisma Lançar Exceções

Não capture exceções do Prisma desnecessariamente:

```typescript
// ❌ Evite
try {
  await this.prisma.user.create({ data });
} catch (error) {
  throw new ConflictException("Email já existe");
}

// ✅ Correto - deixe o PrismaExceptionFilter traduzir
await this.prisma.user.create({ data });
```

### 3. Validação com DTOs

Use class-validator nos DTOs. O ValidationPipe lançará BadRequestException automaticamente:

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "Email é obrigatório" })
  email: string;

  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  password: string;
}
```

### 4. Tratamento de Erros Inesperados

Para operações críticas, você pode adicionar contexto adicional:

```typescript
try {
  // Operação crítica
  await this.processPayment(data);
} catch (error) {
  this.logger.error("Erro ao processar pagamento", error);
  throw new InternalServerErrorException(
    "Não foi possível processar o pagamento. Tente novamente.",
  );
}
```

## Testando os Filters

### Teste Unitário Exemplo

```typescript
import { Test } from "@nestjs/testing";
import { HttpExceptionFilter } from "./http-exception.filter";
import { BadRequestException } from "@nestjs/common";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    filter = new HttpExceptionFilter();
  });

  it("deve formatar BadRequestException corretamente", () => {
    const exception = new BadRequestException("Erro de validação");
    const host = createMockArgumentsHost();

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Erro de validação",
        error: "Bad Request",
      }),
    );
  });
});
```

## Benefícios

✅ **Consistência:** Todas as respostas de erro seguem o mesmo formato  
✅ **Internacionalização:** Mensagens em português para melhor UX  
✅ **Debugging:** Logs detalhados facilitam identificação de problemas  
✅ **Segurança:** Erros internos não expõem detalhes sensíveis  
✅ **Manutenibilidade:** Centralização da lógica de tratamento de erros  
✅ **Produtividade:** Desenvolvedores não precisam formatar erros manualmente

## Próximos Passos

- [ ] Adicionar suporte a internacionalização (i18n)
- [ ] Implementar rate limiting para prevenir spam de logs
- [ ] Adicionar métricas de erros (integração com Prometheus/Grafana)
- [ ] Criar filtros específicos para validação de arquivos
- [ ] Implementar notificações para erros críticos (ex: Slack, email)
