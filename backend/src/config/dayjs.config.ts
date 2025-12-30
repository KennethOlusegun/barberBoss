import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br';

// Carregar plugins essenciais
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Configurações padrão
dayjs.locale('pt-br');
dayjs.tz.setDefault('America/Sao_Paulo');

export default dayjs;
