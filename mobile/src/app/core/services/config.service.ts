import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

/**
 * Configuration Service
 *
 * Provides centralized access to environment configuration throughout the application.
 * This service acts as a single source of truth for all configuration values.
 *
 * @example
 * constructor(private configService: ConfigService) {}
 *
 * const apiUrl = this.configService.getApiUrl();
 * const isDebugEnabled = this.configService.isDebugModeEnabled();
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly config: Environment = environment;

  constructor() {
    if (this.config.features.enableDebugMode) {
      console.log('🔧 Configuration loaded:', this.config);
    }
  }

  /**
   * Get the complete environment configuration
   */
  getConfig(): Environment {
    return this.config;
  }

  /**
   * Check if the application is running in production mode
   */
  isProduction(): boolean {
    return this.config.production;
  }

  // ==================== API Configuration ====================

  /**
   * Get the full API base URL
   * @returns Full API URL including prefix
   * @example 'http://localhost:3000/api'
   */
  getApiUrl(): string {
    return `${this.config.api.baseUrl}${this.config.api.apiPrefix}`;
  }

  /**
   * Get the API base URL without prefix
   * @returns Base URL only
   * @example 'http://localhost:3000'
   */
  getApiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  /**
   * Get the API request timeout in milliseconds
   */
  getApiTimeout(): number {
    return this.config.api.timeout;
  }

  // ==================== Authentication Configuration ====================

  /**
   * Get the token storage key
   */
  getTokenKey(): string {
    return this.config.auth.tokenKey;
  }

  /**
   * Get the refresh token storage key
   */
  getRefreshTokenKey(): string {
    return this.config.auth.refreshTokenKey;
  }

  /**
   * Get the token expiration time in seconds
   */
  getTokenExpirationTime(): number {
    return this.config.auth.tokenExpirationTime;
  }

  // ==================== Application Configuration ====================

  /**
   * Get the application name
   */
  getAppName(): string {
    return this.config.app.name;
  }

  /**
   * Get the application version
   */
  getAppVersion(): string {
    return this.config.app.version;
  }

  /**
   * Get the default language
   */
  getDefaultLanguage(): string {
    return this.config.app.defaultLanguage;
  }

  /**
   * Get the list of supported languages
   */
  getSupportedLanguages(): string[] {
    return this.config.app.supportedLanguages;
  }

  // ==================== Feature Flags ====================

  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled(): boolean {
    return this.config.features.enableDebugMode;
  }

  /**
   * Check if analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.config.features.enableAnalytics;
  }

  /**
   * Check if push notifications are enabled
   */
  arePushNotificationsEnabled(): boolean {
    return this.config.features.enablePushNotifications;
  }

  /**
   * Check if offline mode is enabled
   */
  isOfflineModeEnabled(): boolean {
    return this.config.features.enableOfflineMode;
  }

  // ==================== Logging Configuration ====================

  /**
   * Check if console logging is enabled
   */
  isConsoleLoggingEnabled(): boolean {
    return this.config.logging.enableConsoleLogging;
  }

  /**
   * Get the log level
   */
  getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return this.config.logging.logLevel;
  }

  /**
   * Check if remote logging is enabled
   */
  isRemoteLoggingEnabled(): boolean {
    return this.config.logging.enableRemoteLogging;
  }

  // ==================== Storage Configuration ====================

  /**
   * Get the storage prefix
   */
  getStoragePrefix(): string {
    return this.config.storage.prefix;
  }

  /**
   * Get the storage type
   */
  getStorageType(): 'localStorage' | 'indexedDB' {
    return this.config.storage.type;
  }

  /**
   * Get a prefixed storage key
   * @param key The base key name
   * @returns Prefixed key
   * @example getStorageKey('user') => 'bb_user'
   */
  getStorageKey(key: string): string {
    return `${this.config.storage.prefix}${key}`;
  }

  // ==================== Business Configuration ====================

  /**
   * Get the default appointment duration in minutes
   */
  getDefaultAppointmentDuration(): number {
    return this.config.business.defaultAppointmentDuration;
  }

  /**
   * Get the minimum advance booking time in hours
   */
  getMinAdvanceBooking(): number {
    return this.config.business.minAdvanceBooking;
  }

  /**
   * Get the maximum advance booking time in days
   */
  getMaxAdvanceBooking(): number {
    return this.config.business.maxAdvanceBooking;
  }

  /**
   * Get the cancellation deadline in hours
   */
  getCancellationDeadline(): number {
    return this.config.business.cancellationDeadline;
  }

  // ==================== UI Configuration ====================

  /**
   * Get the default theme
   */
  getDefaultTheme(): 'light' | 'dark' | 'auto' {
    return this.config.ui.defaultTheme;
  }

  /**
   * Check if animations are enabled
   */
  areAnimationsEnabled(): boolean {
    return this.config.ui.enableAnimations;
  }

  /**
   * Get the number of items per page for pagination
   */
  getItemsPerPage(): number {
    return this.config.ui.itemsPerPage;
  }

  // ==================== Utility Methods ====================

  /**
   * Build a complete endpoint URL
   * @param endpoint The endpoint path (with or without leading slash)
   * @returns Full URL
   * @example buildEndpointUrl('/users') => 'http://localhost:3000/api/users'
   */
  buildEndpointUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.getApiBaseUrl()}${cleanEndpoint}`;
  }

  /**
   * Get configuration value by path using dot notation
   * @param path The configuration path (e.g., 'api.baseUrl')
   * @returns The configuration value or undefined if not found
   * @example get('api.baseUrl') => 'http://localhost:3000'
   */
  get(path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config as any);
  }

  /**
   * Check if a specific feature flag is enabled
   * @param featureName The feature flag name
   * @returns Boolean indicating if the feature is enabled
   */
  isFeatureEnabled(featureName: keyof Environment['features']): boolean {
    return this.config.features[featureName] as boolean;
  }

  /**
   * Log configuration information (only in debug mode)
   * @param message The message to log
   * @param data Optional data to include
   */
  log(message: string, data?: any): void {
    if (this.isDebugModeEnabled() && this.isConsoleLoggingEnabled()) {
      console.log(`[ConfigService] ${message}`, data || '');
    }
  }
}
