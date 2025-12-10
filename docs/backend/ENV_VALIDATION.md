# Validação de Ambiente

## Visão Geral

O sistema implementa validação rigorosa de variáveis de ambiente usando `class-validator` e `class-transformer` para garantir que todas as configurações necessárias estejam presentes e válidas antes da aplicação iniciar.

## Funcionalidades

### Validação Automática
- ✅ Validação de tipo (string, number, enum)
- ✅ Validação de range (min/max para portas e horários)
- ✅ Validação de valores obrigatórios
- ✅ Valores padrão para configurações opcionais
- ✅ Mensagens de erro detalhadas

### Variáveis de Ambiente

#### Obrigatórias

| Variável | Tipo | Descrição | Exemplo |
|----------|------|-----------|---------|
| `NODE_ENV` | enum | Ambiente de execução | `development`, `production`, `test` |
| `PORT` | number | Porta do servidor (1-65535) | `3000` |
| `DATABASE_URL` | string | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `POSTGRES_USER` | string | Usuário do banco de dados | `barber_user` |
| `POSTGRES_PASSWORD` | string | Senha do banco de dados | `barber_password` |
| `POSTGRES_DB` | string | Nome do banco de dados | `barber_boss` |
| `JWT_SECRET` | string | Chave secreta para JWT | `your-secret-key` |

#### Opcionais

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `JWT_EXPIRES_IN` | string | `7d` | Tempo de expiração do token JWT |
| `ALLOWED_ORIGINS` | string | - | Origens permitidas para CORS (separadas por vírgula) |
| `CORS_CREDENTIALS` | string | `true` | Permitir credenciais no CORS |
| `THROTTLE_TTL` | number | `60000` | Tempo (ms) para rate limiting |
| `THROTTLE_LIMIT` | number | `10` | Limite de requisições por TTL |
| `DEFAULT_BUSINESS_HOUR_START` | number | `8` | Hora de início do expediente (0-23) |
| `DEFAULT_BUSINESS_HOUR_END` | number | `18` | Hora de fim do expediente (0-23) |
| `DEFAULT_APPOINTMENT_DURATION` | number | `30` | Duração padrão de agendamentos (minutos) |

## Como Usar

### 1. Copiar o Arquivo de Exemplo

```bash
cp .env.example .env
```

### 2. Configurar Variáveis

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://barber_user:barber_password@localhost:5432/barber_boss?schema=public
POSTGRES_USER=barber_user
POSTGRES_PASSWORD=barber_password
POSTGRES_DB=barber_boss
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Iniciar a Aplicação

```bash
npm run start:dev
```

## Validação em Tempo de Inicialização

A validação ocorre durante a inicialização da aplicação no `AppModule`. Se houver algum erro, a aplicação **não iniciará** e exibirá mensagens de erro detalhadas:

```
Environment validation failed:
PORT: must not be less than 1
JWT_SECRET: should not be empty
DATABASE_URL: should not be empty

Please check your .env file and ensure all required variables are set correctly.
```

## Implementação Técnica

### Arquivo de Validação (`src/config/env.validation.ts`)

```typescript
class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsNotEmpty()
  PORT: number;

  // ... outras validações
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables, 
    config,
    { enableImplicitConversion: true }
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error('Environment validation failed');
  }

  return validatedConfig;
}
```

### Configuração no AppModule

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,           // Função de validação
      cache: true,        // Cache das variáveis
      expandVariables: true, // Expansão de variáveis
    }),
    // ... outros módulos
  ],
})
export class AppModule {}
```

## Acesso às Variáveis

Use o `ConfigService` para acessar variáveis validadas:

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  getPort() {
    // Tipo seguro, sempre será um número válido
    return this.configService.get<number>('PORT');
  }

  getJwtSecret() {
    // Sempre retornará uma string não vazia
    return this.configService.get<string>('JWT_SECRET');
  }
}
```

## Segurança

⚠️ **IMPORTANTE**: 

1. **Nunca commite** o arquivo `.env` no git
2. `.env` está no `.gitignore`
3. Use `.env.example` como template
4. Use senhas fortes em produção
5. Altere `JWT_SECRET` para um valor único e secreto
6. Em produção, use variáveis de ambiente do sistema ou serviço de secrets

## Ambientes

### Development
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/barber_boss_dev
```

### Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://prod-host:5432/barber_boss
JWT_SECRET=complex-secret-key-from-secrets-manager
ALLOWED_ORIGINS=https://app.barberboss.com,https://www.barberboss.com
```

### Test
```env
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://localhost:5432/barber_boss_test
```

## Troubleshooting

### Erro: "should not be empty"
- Verifique se a variável está definida no arquivo `.env`
- Certifique-se de que não há espaços extras

### Erro: "must be a valid enum value"
- `NODE_ENV` deve ser: `development`, `production` ou `test`

### Erro: "must not be less than X"
- Verifique ranges de valores numéricos
- `PORT`: 1-65535
- `DEFAULT_BUSINESS_HOUR_START/END`: 0-23

### Erro: "must be a number"
- Certifique-se de que valores numéricos não estão entre aspas
- Exemplo correto: `PORT=3000` (não `PORT="3000"`)

## Benefícios

✅ **Fail-fast**: Erros detectados na inicialização, não em runtime  
✅ **Type-safe**: Tipos garantidos pelo TypeScript  
✅ **Auto-documentado**: Schema de validação documenta requisitos  
✅ **Mensagens claras**: Erros específicos e acionáveis  
✅ **Valores padrão**: Configuração simplificada para desenvolvimento  
✅ **Segurança**: Validação previne configurações inseguras
