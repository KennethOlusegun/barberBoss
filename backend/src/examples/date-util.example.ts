import { DateUtil } from '../utils/date.util';

/**
 * Exemplos de uso do DateUtil com Day.js configurado para timezone PT-BR
 */

// Obter data atual no timezone de São Paulo
const now = DateUtil.now();
console.log('Data atual (SP):', DateUtil.formatBR(now));

// Converter data para timezone local
const date = new Date('2024-01-15T10:30:00Z');
const localDate = DateUtil.toLocalTimezone(date);
console.log('Data local:', DateUtil.formatBR(localDate));

// Converter para UTC
const utcDate = DateUtil.toUTC(date);
console.log('Data UTC:', DateUtil.formatISO(utcDate));

// Adicionar dias
const futureDate = DateUtil.add(now, 7, 'days');
console.log('Daqui a 7 dias:', DateUtil.formatBR(futureDate));

// Subtrair horas
const pastDate = DateUtil.subtract(now, 2, 'hours');
console.log('2 horas atrás:', DateUtil.formatBR(pastDate));

// Comparar datas
const isBeforeResult = DateUtil.isBefore(pastDate, now);
console.log('pastDate é antes de now?', isBeforeResult);

// Início e fim do dia
const startDay = DateUtil.startOfDay(now);
const endDay = DateUtil.endOfDay(now);
console.log('Início do dia:', DateUtil.formatBR(startDay));
console.log('Fim do dia:', DateUtil.formatBR(endDay));

// Diferença entre datas
const diffInDays = DateUtil.diff(futureDate, now, 'days');
console.log('Diferença em dias:', diffInDays);
