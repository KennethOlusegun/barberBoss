// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from './environment.interface';

/**
 * Development Environment Configuration
 * This configuration is used during local development
 */
export const environment: Environment = {
  production: false,

  api: {
    baseUrl: 'http://localhost:3000',
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
    enableDebugMode: true,
    enableAnalytics: false,
    enablePushNotifications: false,
    enableOfflineMode: true,
  },

  logging: {
    enableConsoleLogging: true,
    logLevel: 'debug',
    enableRemoteLogging: false,
  },

  storage: {
    prefix: 'bb_',
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
