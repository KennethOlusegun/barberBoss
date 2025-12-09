import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br';

// Configurar plugins do Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Definir locale padrão para PT-BR
dayjs.locale('pt-br');

// Definir timezone padrão para America/Sao_Paulo (UTC-3/PT-BR)
dayjs.tz.setDefault('America/Sao_Paulo');

export default dayjs;
