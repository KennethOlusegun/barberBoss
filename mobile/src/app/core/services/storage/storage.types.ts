/**
 * Storage Service Types and Interfaces
 *
 * Defines all types and interfaces used by the storage service.
 */

/**
 * Storage keys used throughout the application
 * Centralized definition prevents typos and makes refactoring easier
 */
export enum StorageKey {
  // Authentication
  ACCESS_TOKEN = 'auth.access_token',
  REFRESH_TOKEN = 'auth.refresh_token',
  USER_DATA = 'auth.user_data',

  // User Preferences
  THEME = 'preferences.theme',
  LANGUAGE = 'preferences.language',
  NOTIFICATIONS_ENABLED = 'preferences.notifications_enabled',

  // Application State
  ONBOARDING_COMPLETED = 'app.onboarding_completed',
  LAST_SYNC = 'app.last_sync',

  // Cache
  CACHE_PREFIX = 'cache.',
}

/**
 * Storage options for advanced operations
 */
export interface StorageOptions {
  /**
   * Time to live in milliseconds
   * After this time, the data is considered expired
   */
  ttl?: number;

  /**
   * Whether to encrypt the data
   */
  encrypt?: boolean;
}

/**
 * Stored data wrapper with metadata
 */
export interface StoredData<T = any> {
  /**
   * The actual data
   */
  value: T;

  /**
   * Timestamp when the data was stored
   */
  timestamp: number;

  /**
   * Expiration timestamp (if TTL is set)
   */
  expiresAt?: number;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  /**
   * Total number of items in storage
   */
  itemCount: number;

  /**
   * List of all keys
   */
  keys: string[];

  /**
   * Estimated size in bytes (approximate)
   */
  estimatedSize?: number;
}

/**
 * Storage migration interface
 * Used for handling storage schema changes between app versions
 */
export interface StorageMigration {
  /**
   * Version this migration targets
   */
  version: number;

  /**
   * Migration function
   */
  migrate: () => Promise<void>;
}
