# Módulo de Autenticação - BarberBoss

## 📋 Visão Geral

O módulo de autenticação foi adaptado para atender às necessidades específicas do projeto BarberBoss, um sistema de agendamento para barbearias com três tipos de usuários: **ADMIN**, **BARBER** e **CLIENT**.

## 🔐 Recursos Implementados

### 1. **Endpoints de Autenticação**

#### `POST /auth/register`

- Registro de novos usuários
- Retorna token JWT e dados do usuário
- Permite definir o papel (role) do usuário
- Hash automático de senha com bcrypt
- Validação de email único

**Exemplo de Request:**

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "Senha123!",
  "phone": "(11) 98765-4321",
  "role": "BARBER"
}
```

**Exemplo de Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(11) 98765-4321",
    "role": "BARBER",
    "createdAt": "2025-12-09T..."
  }
}
```

#### `POST /auth/login`

- Login de usuários existentes
- Retorna token JWT e dados do usuário
- Validação de credenciais

**Exemplo de Request:**

```json
{
  "email": "joao@exemplo.com",
  "password": "Senha123!"
}
```

#### `GET /auth/me`

- Retorna perfil do usuário autenticado
- Requer token JWT no header Authorization
- Formato: `Bearer <token>`

**Exemplo de Response:**

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "(11) 98765-4321",
  "role": "BARBER",
  "createdAt": "2025-12-09T...",
  "updatedAt": "2025-12-09T..."
}
```

### 2. **Guards Implementados**

#### `JwtAuthGuard`

- Protege rotas que requerem autenticação
- Aplicado globalmente em toda a aplicação
- Verifica token JWT no header Authorization
- Rotas públicas podem usar o decorator `@Public()`

#### `RolesGuard`

- Protege rotas por papel de usuário (role)
- Aplicado após o JwtAuthGuard
- Usa o decorator `@Roles()` para definir roles permitidas

### 3. **Decorators Customizados**

#### `@Public()`

Marca uma rota como pública (sem autenticação):

```typescript
@Public()
@Get('public-endpoint')
async publicEndpoint() {
  return 'Acesso público';
}
```

#### `@Roles(...roles)`

Define quais roles podem acessar uma rota:

```typescript
@Roles(Role.ADMIN, Role.BARBER)
@Get('protected-endpoint')
async protectedEndpoint() {
  return 'Apenas ADMIN e BARBER';
}
```

#### `@CurrentUser()`

Obtém o usuário autenticado da requisição:

```typescript
@Get('my-data')
async getMyData(@CurrentUser() user: UserFromJwt) {
  return user;
}
```

## 🏗️ Estrutura do Módulo

```
src/auth/
├── auth.controller.ts        # Endpoints de autenticação
├── auth.service.ts           # Lógica de negócio
├── auth.module.ts            # Configuração do módulo
├── dto/
│   ├── login.dto.ts          # DTO para login
│   └── register.dto.ts       # DTO para registro
├── guards/
│   ├── jwt-auth.guard.ts     # Guard de autenticação JWT
│   └── roles.guard.ts        # Guard de autorização por role
├── models/
│   ├── UserPayload.ts        # Payload do token JWT
│   └── UserFromJwt.ts        # Interface do usuário autenticado
└── strategies/
    └── jwt-strategies.ts     # Estratégia JWT do Passport
```

## 🔧 Configuração

### Variáveis de Ambiente

Configure a variável `JWT_SECRET` no arquivo `.env`:

```env
JWT_SECRET=sua_chave_secreta_aqui
```

⚠️ **IMPORTANTE**: Use uma chave forte em produção!

### Token JWT

- **Validade**: 24 horas
- **Algoritmo**: HS256
- **Payload**: id, email, role

## 🎯 Exemplos de Uso

### Protegendo uma Rota

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
async protectedRoute() {
  return 'Conteúdo protegido';
}
```

### Protegendo por Role

```typescript
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.userService.remove(id);
}
```

### Obtendo Usuário Autenticado

```typescript
@Get('appointments')
async getMyAppointments(@CurrentUser() user: UserFromJwt) {
  return this.appointmentService.findByUserId(user.id);
}
```

## 🔒 Segurança

- ✅ Senhas armazenadas com hash bcrypt (salt rounds: 10)
- ✅ Validação de email único no registro
- ✅ Token JWT com expiração
- ✅ Guards aplicados globalmente
- ✅ Validação de dados com class-validator
- ✅ Documentação Swagger automática

## 📝 Roles Disponíveis

| Role       | Descrição                | Permissões Típicas               |
| ---------- | ------------------------ | -------------------------------- |
| **ADMIN**  | Administrador do sistema | Acesso total ao sistema          |
| **BARBER** | Barbeiro                 | Gerenciar agendamentos, serviços |
| **CLIENT** | Cliente                  | Visualizar e criar agendamentos  |

## 🚀 Próximos Passos

- [ ] Implementar refresh tokens
- [ ] Adicionar autenticação com Google/Facebook
- [ ] Implementar recuperação de senha
- [ ] Adicionar rate limiting
- [ ] Implementar 2FA (autenticação em dois fatores)
- [ ] Adicionar logs de atividades de usuário

## 📚 Dependências

- `@nestjs/jwt` - Módulo JWT do NestJS
- `@nestjs/passport` - Integração com Passport
- `passport-jwt` - Estratégia JWT do Passport
- `bcrypt` - Hash de senhas
- `class-validator` - Validação de DTOs
- `class-transformer` - Transformação de dados

## 🐛 Troubleshooting

### Token inválido ou expirado

Certifique-se de:

1. Incluir o header `Authorization: Bearer <token>`
2. O token ainda está válido (não expirou)
3. O JWT_SECRET está configurado corretamente

### Acesso negado (403 Forbidden)

Verifique se:

1. O usuário tem a role necessária para acessar a rota
2. Os guards estão aplicados corretamente
3. O decorator `@Roles()` está especificando as roles corretas
