# Integração Day.js com Timezone UTC/PT-BR

Este projeto está configurado para usar Day.js com suporte completo a timezone UTC e PT-BR (America/Sao_Paulo).

## 📦 Instalação

O Day.js já está instalado com os seguintes plugins:
- `dayjs` - Biblioteca principal
- `utc` - Plugin para trabalhar com UTC
- `timezone` - Plugin para trabalhar com timezones
- `customParseFormat` - Plugin para parsing personalizado
- Locale `pt-br` - Tradução para português brasileiro

## ⚙️ Configuração

O Day.js está configurado automaticamente no arquivo `src/config/dayjs.config.ts`:
- **Timezone padrão**: America/Sao_Paulo (UTC-3)
- **Locale padrão**: pt-br
- **Plugins ativos**: UTC, Timezone, CustomParseFormat

A configuração é carregada automaticamente no `main.ts`, então não é necessário importar manualmente.

## 🛠️ Uso

### Classe Utilitária DateUtil

O projeto fornece uma classe `DateUtil` em `src/utils/date.util.ts` com diversos métodos auxiliares:

#### Métodos Disponíveis

```typescript
import { DateUtil } from './utils/date.util';

// Obter data atual no timezone de São Paulo
const now = DateUtil.now();

// Converter data para timezone local (America/Sao_Paulo)
const localDate = DateUtil.toLocalTimezone('2024-01-15T10:30:00Z');

// Converter data para UTC
const utcDate = DateUtil.toUTC(new Date());

// Formatar data no formato brasileiro (DD/MM/YYYY HH:mm:ss)
const formatted = DateUtil.formatBR(now);

// Formatar data no formato ISO 8601
const iso = DateUtil.formatISO(now);

// Validar data
const isValid = DateUtil.isValid('2024-01-15');

// Adicionar tempo
const futureDate = DateUtil.add(now, 7, 'days');

// Subtrair tempo
const pastDate = DateUtil.subtract(now, 2, 'hours');

// Comparar datas
const isBefore = DateUtil.isBefore(pastDate, now);
const isAfter = DateUtil.isAfter(futureDate, now);

// Início e fim do dia
const startDay = DateUtil.startOfDay(now);
const endDay = DateUtil.endOfDay(now);

// Diferença entre datas
const diffInDays = DateUtil.diff(futureDate, now, 'days');
```

### Uso Direto do Day.js

Se preferir usar o Day.js diretamente:

```typescript
import { dayjs } from './config/dayjs.config';

// Usar day.js normalmente
const date = dayjs().tz('America/Sao_Paulo');
console.log(date.format('DD/MM/YYYY HH:mm:ss'));
```

## 📝 Exemplos

Veja exemplos completos de uso em `src/examples/date-util.example.ts`.

## 🌍 Timezones Suportados

O projeto está configurado para usar principalmente:
- **America/Sao_Paulo**: Horário de Brasília (UTC-3)
- **UTC**: Tempo Universal Coordenado

Você pode usar qualquer timezone válido do [IANA timezone database](https://www.iana.org/time-zones).

## 📖 Documentação Day.js

Para mais informações sobre Day.js, consulte:
- [Documentação Day.js](https://day.js.org/)
- [Plugin Timezone](https://day.js.org/docs/en/plugin/timezone)
- [Plugin UTC](https://day.js.org/docs/en/plugin/utc)

## 🔧 Troubleshooting

### Problemas com Timezone

Se você encontrar problemas com timezone, verifique:
1. O timezone está correto no `dayjs.config.ts`
2. Os plugins estão sendo carregados corretamente
3. O `main.ts` está importando a configuração

### Problemas com Locale

Se as datas não estiverem em português:
1. Verifique se o locale 'pt-br' está sendo importado
2. Confirme que `dayjs.locale('pt-br')` está sendo chamado
