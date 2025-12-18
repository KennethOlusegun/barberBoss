import { Environment } from './environment.interface';

/**
 * Production Environment Configuration
 * This configuration is used in production builds
 *
 * IMPORTANT: Update these values with your production settings before deploying
 */
export const environment: Environment = {
  production: true,

  api: {
    baseUrl: 'https://edacious-closer-catrice.ngrok-free.dev',
    apiPrefix: '',
    timeout: 45000, // AUMENTADO: 45s para conexões instáveis
  },

  auth: {
    tokenKey: 'barber_boss_token',
    refreshTokenKey: 'barber_boss_refresh_token',
    tokenExpirationTime: 3600, // 1 hour
  },

  app: {
    name: 'Barber Boss Beta',
    version: '0.0.1-beta',
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['pt-BR', 'en-US'],
  },

  features: {
    enableDebugMode: true, // ATIVADO para beta testing
    enableAnalytics: false,
    enablePushNotifications: false,
    enableOfflineMode: true,
  },

  logging: {
    enableConsoleLogging: true, // ATIVADO para debug
    logLevel: 'debug',
    enableRemoteLogging: false,
  },

  storage: {
    prefix: 'bb_beta_',
    type: 'localStorage',
  },

  business: {
    defaultAppointmentDuration: 60, // minutes
    minAdvanceBooking: 1, // hours
    maxAdvanceBooking: 30, // days
    cancellationDeadline: 2, // hours
  },

  ui: {
    defaultTheme: 'auto',
    enableAnimations: true,
    itemsPerPage: 10,
  },
};
