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
    baseUrl: 'https://api.barberboss.com', // TODO: Update with your production API URL
    apiPrefix: '',
    timeout: 30000,
  },

  auth: {
    tokenKey: 'barber_boss_token',
    refreshTokenKey: 'barber_boss_refresh_token',
    tokenExpirationTime: 3600, // 1 hour
  },

  app: {
    name: 'Barber Boss',
    version: '0.0.1',
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['pt-BR', 'en-US'],
  },

  features: {
    enableDebugMode: false,
    enableAnalytics: true,
    enablePushNotifications: true,
    enableOfflineMode: true,
  },

  logging: {
    enableConsoleLogging: false,
    logLevel: 'error',
    enableRemoteLogging: true,
  },

  storage: {
    prefix: 'bb_',
    type: 'indexedDB',
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
