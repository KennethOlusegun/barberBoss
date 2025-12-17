# Rate Limiting

## Visão Geral

O sistema de rate limiting foi implementado para proteger a API contra abuso e ataques de negação de serviço (DoS). Utilizamos o módulo `@nestjs/throttler` para gerenciar os limites de requisições.

## Configuração Global

A configuração global está definida no `app.module.ts` com três níveis de throttling:

### Níveis de Throttling

1. **Short (Curto)**
   - TTL: 1 segundo
   - Limite: 3 requisições
   - Uso: Proteção contra burst excessivo

2. **Medium (Médio)**
   - TTL: 10 segundos
   - Limite: 20 requisições
   - Uso: Controle de taxa moderado

3. **Long (Longo)**
   - TTL: 1 minuto
   - Limite: 100 requisições
   - Uso: Limite geral por minuto

## Decorators Customizados

Criamos decorators para facilitar a aplicação de rate limiting:

### `@SkipThrottle()`

Desabilita o rate limiting em rotas específicas.

```typescript
@SkipThrottle()
@Get('public')
getPublicData() {
  return this.service.getPublicData();
}
```

### `@Throttle(limit, ttl)`

Aplica rate limiting customizado.

```typescript
@Throttle(5, 30000) // 5 requisições a cada 30 segundos
@Post('custom')
customEndpoint() {
  return this.service.process();
}
```

### `@ThrottleStrict()`

Rate limiting estrito para operações sensíveis (5 requisições por minuto).

**Uso recomendado:**

- Login
- Registro
- Redefinição de senha
- Operações financeiras

```typescript
@ThrottleStrict()
@Post('login')
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### `@ThrottleModerate()`

Rate limiting moderado para operações comuns (30 requisições por minuto).

**Uso recomendado:**

- Criação de recursos
- Atualização de dados
- Operações de escrita

```typescript
@ThrottleModerate()
@Post()
create(@Body() createDto: CreateDto) {
  return this.service.create(createDto);
}
```

### `@ThrottleRelaxed()`

Rate limiting relaxado para leitura (100 requisições por minuto).

**Uso recomendado:**

- Listagem de recursos
- Consultas
- Operações de leitura

```typescript
@ThrottleRelaxed()
@Get()
findAll() {
  return this.service.findAll();
}
```

## Implementação por Módulo

### Auth Module

- **Login**: `@ThrottleStrict()` - 5 req/min
- **Registro**: `@ThrottleStrict()` - 5 req/min
- **Me**: Rate limiting padrão

### Appointment Module

- **Criar**: `@ThrottleModerate()` - 30 req/min
- **Listar**: `@ThrottleRelaxed()` - 100 req/min
- **Buscar por ID**: Rate limiting padrão
- **Atualizar/Deletar**: Rate limiting padrão

### User Module

- **Criar**: `@ThrottleModerate()` - 30 req/min (apenas ADMIN)
- **Listar**: `@ThrottleRelaxed()` - 100 req/min (apenas ADMIN)
- **Outros**: Rate limiting padrão

### Service Module

- **Criar**: `@ThrottleModerate()` - 30 req/min (apenas ADMIN)
- **Listar**: `@ThrottleRelaxed()` - 100 req/min (público)
- **Outros**: Rate limiting padrão

## Respostas HTTP

Quando o limite de rate é excedido, a API retorna:

**Status Code:** `429 Too Many Requests`

**Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1639584000
```

**Body:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Melhores Práticas

1. **Endpoints Sensíveis**: Sempre use `@ThrottleStrict()` para autenticação e operações críticas
2. **Operações de Leitura**: Use `@ThrottleRelaxed()` para endpoints de consulta
3. **Operações de Escrita**: Use `@ThrottleModerate()` para criação e atualização
4. **APIs Públicas**: Considere limites mais restritivos para endpoints públicos
5. **Monitoramento**: Monitore logs de rate limiting para identificar padrões de abuso

## Customização

Para customizar os limites globais, edite o `ThrottlerModule.forRoot()` em `app.module.ts`:

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,
    limit: 3,
  },
  // ... outros níveis
]),
```

## Exceções

Alguns endpoints podem precisar de tratamento especial:

- **Webhooks**: Considere usar `@SkipThrottle()` ou limites específicos
- **Health checks**: Geralmente devem ser isentos
- **Uploads de arquivos**: Podem precisar de limites mais restritivos

## Segurança Adicional

O rate limiting é apenas uma camada de proteção. Combine com:

- Autenticação JWT
- Guards de autorização
- Validação de entrada
- CORS configurado corretamente
- Helmet para headers de segurança
- Rate limiting por IP no nginx/proxy reverso

## Testando Rate Limiting

Para testar os limites:

```bash
# Usando curl
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
  echo "Request $i"
  sleep 0.1
done
```

Após exceder o limite, você receberá respostas 429.

## Referências

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [OWASP Rate Limiting](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
