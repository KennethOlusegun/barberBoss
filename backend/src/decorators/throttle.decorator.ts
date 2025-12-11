import { SetMetadata } from '@nestjs/common';
import { Throttle as NestThrottle } from '@nestjs/throttler';

/**
 * Decorator para desabilitar o rate limiting em rotas específicas
 */
export const SkipThrottle = () => SetMetadata('skipThrottle', true);

/**
 * Decorator para aplicar rate limiting customizado em rotas específicas
 *
 * @param limit - Número máximo de requisições
 * @param ttl - Tempo em milissegundos
 */
export const Throttle = (limit: number, ttl: number) =>
  NestThrottle({ default: { limit, ttl } });

/**
 * Rate limiting estrito para operações sensíveis (ex: login, cadastro)
 * 5 requisições por minuto
 */
export const ThrottleStrict = () =>
  NestThrottle({ strict: { ttl: 60000, limit: 5 } });

/**
 * Rate limiting moderado para operações comuns
 * 30 requisições por minuto
 */
export const ThrottleModerate = () =>
  NestThrottle({ moderate: { ttl: 60000, limit: 30 } });

/**
 * Rate limiting relaxado para leitura
 * 100 requisições por minuto
 */
export const ThrottleRelaxed = () =>
  NestThrottle({ relaxed: { ttl: 60000, limit: 100 } });
