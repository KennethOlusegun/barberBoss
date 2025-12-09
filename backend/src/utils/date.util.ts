import dayjs from '../config/dayjs.config';
import type { Dayjs, ManipulateType, QUnitType, OpUnitType } from 'dayjs';

/**
 * Utilitário para manipulação de datas com Day.js configurado para timezone PT-BR
 */
export class DateUtil {
  /**
   * Retorna a data atual no timezone America/Sao_Paulo
   */
  static now(): Dayjs {
    return dayjs().tz('America/Sao_Paulo');
  }

  /**
   * Converte uma data para o timezone America/Sao_Paulo
   */
  static toLocalTimezone(date: string | Date | Dayjs): Dayjs {
    return dayjs(date).tz('America/Sao_Paulo');
  }

  /**
   * Converte uma data para UTC
   */
  static toUTC(date: string | Date | Dayjs): Dayjs {
    return dayjs(date).utc();
  }

  /**
   * Formata uma data no formato brasileiro (DD/MM/YYYY HH:mm:ss)
   */
  static formatBR(date: string | Date | Dayjs): string {
    return dayjs(date).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
  }

  /**
   * Formata uma data no formato ISO 8601
   */
  static formatISO(date: string | Date | Dayjs): string {
    return dayjs(date).toISOString();
  }

  /**
   * Verifica se uma data é válida
   */
  static isValid(date: string | Date | Dayjs): boolean {
    return dayjs(date).isValid();
  }

  /**
   * Adiciona tempo a uma data
   */
  static add(
    date: string | Date | Dayjs,
    amount: number,
    unit: ManipulateType,
  ): Dayjs {
    return dayjs(date).add(amount, unit);
  }

  /**
   * Subtrai tempo de uma data
   */
  static subtract(
    date: string | Date | Dayjs,
    amount: number,
    unit: ManipulateType,
  ): Dayjs {
    return dayjs(date).subtract(amount, unit);
  }

  /**
   * Compara se uma data é antes de outra
   */
  static isBefore(
    date1: string | Date | Dayjs,
    date2: string | Date | Dayjs,
  ): boolean {
    return dayjs(date1).isBefore(dayjs(date2));
  }

  /**
   * Compara se uma data é depois de outra
   */
  static isAfter(
    date1: string | Date | Dayjs,
    date2: string | Date | Dayjs,
  ): boolean {
    return dayjs(date1).isAfter(dayjs(date2));
  }

  /**
   * Retorna o início do dia para uma data
   */
  static startOfDay(date: string | Date | Dayjs): Dayjs {
    return dayjs(date).tz('America/Sao_Paulo').startOf('day');
  }

  /**
   * Retorna o fim do dia para uma data
   */
  static endOfDay(date: string | Date | Dayjs): Dayjs {
    return dayjs(date).tz('America/Sao_Paulo').endOf('day');
  }

  /**
   * Calcula a diferença entre duas datas
   */
  static diff(
    date1: string | Date | Dayjs,
    date2: string | Date | Dayjs,
    unit?: QUnitType | OpUnitType,
  ): number {
    return dayjs(date1).diff(dayjs(date2), unit);
  }
}
