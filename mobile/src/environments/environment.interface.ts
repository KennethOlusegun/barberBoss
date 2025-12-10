/**
 * Interface for Environment Configuration
 * Defines all configuration options available in the application
 */
export interface Environment {
  /**
   * Indicates if the application is running in production mode
   */
  production: boolean;

  /**
   * API configuration
   */
  api: {
    /**
     * Base URL for the backend API
     * @example 'http://localhost:3000' | 'https://api.barberboss.com'
     */
    baseUrl: string;

    /**
     * API version prefix
     * @example '/api/v1'
     */
    apiPrefix: string;

    /**
     * Request timeout in milliseconds
     * @default 30000
     */
    timeout: number;
  };

  /**
   * Authentication configuration
   */
  auth: {
    /**
     * Token storage key in local storage
     */
    tokenKey: string;

    /**
     * Refresh token storage key
     */
    refreshTokenKey: string;

    /**
     * Token expiration time in seconds
     */
    tokenExpirationTime: number;
  };

  /**
   * Application configuration
   */
  app: {
    /**
     * Application name
     */
    name: string;

    /**
     * Application version
     */
    version: string;

    /**
     * Default language
     * @example 'pt-BR' | 'en-US'
     */
    defaultLanguage: string;

    /**
     * Supported languages
     */
    supportedLanguages: string[];
  };

  /**
   * Feature flags
   */
  features: {
    /**
     * Enable debug mode with additional logging
     */
    enableDebugMode: boolean;

    /**
     * Enable analytics tracking
     */
    enableAnalytics: boolean;

    /**
     * Enable push notifications
     */
    enablePushNotifications: boolean;

    /**
     * Enable offline mode
     */
    enableOfflineMode: boolean;
  };

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Enable console logging
     */
    enableConsoleLogging: boolean;

    /**
     * Log level: 'debug' | 'info' | 'warn' | 'error'
     */
    logLevel: 'debug' | 'info' | 'warn' | 'error';

    /**
     * Enable remote logging to external service
     */
    enableRemoteLogging: boolean;
  };

  /**
   * Storage configuration
   */
  storage: {
    /**
     * Storage prefix for all keys
     */
    prefix: string;

    /**
     * Storage type: 'localStorage' | 'indexedDB'
     */
    type: 'localStorage' | 'indexedDB';
  };

  /**
   * Business rules configuration
   */
  business: {
    /**
     * Default appointment duration in minutes
     */
    defaultAppointmentDuration: number;

    /**
     * Minimum advance booking time in hours
     */
    minAdvanceBooking: number;

    /**
     * Maximum advance booking time in days
     */
    maxAdvanceBooking: number;

    /**
     * Cancellation deadline in hours before appointment
     */
    cancellationDeadline: number;
  };

  /**
   * UI/UX configuration
   */
  ui: {
    /**
     * Default theme: 'light' | 'dark' | 'auto'
     */
    defaultTheme: 'light' | 'dark' | 'auto';

    /**
     * Enable animations
     */
    enableAnimations: boolean;

    /**
     * Items per page for pagination
     */
    itemsPerPage: number;
  };
}
