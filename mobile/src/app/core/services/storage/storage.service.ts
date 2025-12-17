import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {
  StorageKey,
  StorageOptions,
  StoredData,
  StorageStats,
  StorageMigration,
} from './storage.types';

/**
 * Storage Service
 *
 * Provides a robust wrapper around Capacitor Preferences API with additional features:
 * - Type-safe storage operations
 * - TTL (Time To Live) support
 * - Data expiration handling
 * - Automatic JSON serialization/deserialization
 * - Storage statistics and management
 * - Migration support
 *
 * @example
 * ```typescript
 * // Store data
 * await storageService.set('user.name', 'John Doe');
 *
 * // Store with TTL (expires in 1 hour)
 * await storageService.set('session', data, { ttl: 3600000 });
 *
 * // Retrieve data
 * const name = await storageService.get<string>('user.name');
 *
 * // Remove data
 * await storageService.remove('user.name');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly VERSION_KEY = 'storage.version';
  private readonly CURRENT_VERSION = 1;
  private migrations: StorageMigration[] = [];

  constructor() {
    this.initializeMigrations();
  }

  /**
   * Initialize the storage service
   * Should be called during app initialization
   */
  async initialize(): Promise<void> {
    try {
      await this.runMigrations();
      await this.cleanupExpiredItems();
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw error;
    }
  }

  /**
   * Store data with optional TTL and encryption
   *
   * @param key - Storage key (use StorageKey enum for common keys)
   * @param value - Data to store (will be JSON serialized)
   * @param options - Storage options (TTL, encryption)
   * @returns Promise that resolves when data is stored
   *
   * @example
   * ```typescript
   * // Simple storage
   * await storage.set('username', 'john_doe');
   *
   * // With TTL (expires in 24 hours)
   * await storage.set('temp_data', data, { ttl: 86400000 });
   * ```
   */
  async set<T = any>(
    key: string | StorageKey,
    value: T,
    options?: StorageOptions,
  ): Promise<void> {
    try {
      const storedData: StoredData<T> = {
        value,
        timestamp: Date.now(),
      };

      // Add expiration if TTL is set
      if (options?.ttl) {
        storedData.expiresAt = Date.now() + options.ttl;
      }

      const serialized = JSON.stringify(storedData);
      await Preferences.set({
        key: String(key),
        value: serialized,
      });
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Retrieve data from storage
   * Automatically handles expired data and JSON deserialization
   *
   * @param key - Storage key
   * @returns Promise that resolves with the data or null if not found/expired
   *
   * @example
   * ```typescript
   * const user = await storage.get<User>('user_data');
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  async get<T = any>(key: string | StorageKey): Promise<T | null> {
    try {
      const result = await Preferences.get({ key: String(key) });

      if (!result.value) {
        return null;
      }

      const storedData: StoredData<T> = JSON.parse(result.value);

      // Check if data has expired
      if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
        await this.remove(key);
        return null;
      }

      return storedData.value;
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove a specific item from storage
   *
   * @param key - Storage key to remove
   * @returns Promise that resolves when item is removed
   */
  async remove(key: string | StorageKey): Promise<void> {
    try {
      await Preferences.remove({ key: String(key) });
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all storage data
   * Use with caution!
   *
   * @returns Promise that resolves when all data is cleared
   */
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in storage
   *
   * @param key - Storage key to check
   * @returns Promise that resolves with true if key exists, false otherwise
   */
  async has(key: string | StorageKey): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get all keys in storage
   *
   * @returns Promise that resolves with array of all storage keys
   */
  async keys(): Promise<string[]> {
    try {
      const result = await Preferences.keys();
      return result.keys;
    } catch (error) {
      console.error('Failed to get storage keys:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   *
   * @returns Promise that resolves with storage statistics
   */
  async getStats(): Promise<StorageStats> {
    try {
      const keys = await this.keys();
      let estimatedSize = 0;

      // Calculate estimated size
      for (const key of keys) {
        const result = await Preferences.get({ key });
        if (result.value) {
          estimatedSize += result.value.length;
        }
      }

      return {
        itemCount: keys.length,
        keys,
        estimatedSize,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        itemCount: 0,
        keys: [],
        estimatedSize: 0,
      };
    }
  }

  /**
   * Remove all items matching a key prefix
   * Useful for clearing cache or specific data groups
   *
   * @param prefix - Key prefix to match
   * @returns Promise that resolves when all matching items are removed
   *
   * @example
   * ```typescript
   * // Remove all cache items
   * await storage.removeByPrefix('cache.');
   * ```
   */
  async removeByPrefix(prefix: string): Promise<void> {
    try {
      const keys = await this.keys();
      const matchingKeys = keys.filter((key) => key.startsWith(prefix));

      await Promise.all(matchingKeys.map((key) => this.remove(key)));
    } catch (error) {
      console.error(`Failed to remove items with prefix "${prefix}":`, error);
      throw error;
    }
  }

  /**
   * Clean up expired items from storage
   * Automatically called on initialization
   *
   * @returns Promise that resolves when cleanup is complete
   */
  async cleanupExpiredItems(): Promise<void> {
    try {
      const keys = await this.keys();

      for (const key of keys) {
        // This will automatically remove expired items
        await this.get(key);
      }
    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
    }
  }

  /**
   * Get the raw stored data (including metadata)
   * Useful for debugging or advanced use cases
   *
   * @param key - Storage key
   * @returns Promise that resolves with the stored data wrapper or null
   */
  async getRaw<T = any>(
    key: string | StorageKey,
  ): Promise<StoredData<T> | null> {
    try {
      const result = await Preferences.get({ key: String(key) });

      if (!result.value) {
        return null;
      }

      return JSON.parse(result.value);
    } catch (error) {
      console.error(`Failed to get raw storage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Check if stored data has expired without removing it
   *
   * @param key - Storage key
   * @returns Promise that resolves with true if expired, false otherwise
   */
  async isExpired(key: string | StorageKey): Promise<boolean> {
    try {
      const storedData = await this.getRaw(key);

      if (!storedData) {
        return true;
      }

      if (!storedData.expiresAt) {
        return false;
      }

      return Date.now() > storedData.expiresAt;
    } catch (error) {
      console.error(`Failed to check expiration for key "${key}":`, error);
      return true;
    }
  }

  /**
   * Refresh the TTL of a stored item
   * Extends the expiration time by the specified duration
   *
   * @param key - Storage key
   * @param ttl - New TTL in milliseconds
   * @returns Promise that resolves when TTL is refreshed
   */
  async refreshTTL(key: string | StorageKey, ttl: number): Promise<void> {
    try {
      const value = await this.get(key);

      if (value !== null) {
        await this.set(key, value, { ttl });
      }
    } catch (error) {
      console.error(`Failed to refresh TTL for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Register a storage migration
   *
   * @param migration - Migration configuration
   */
  registerMigration(migration: StorageMigration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Initialize default migrations
   */
  private initializeMigrations(): void {
    // Add future migrations here
    // Example:
    // this.registerMigration({
    //   version: 2,
    //   migrate: async () => {
    //     // Migration logic
    //   },
    // });
  }

  /**
   * Run pending migrations
   */
  private async runMigrations(): Promise<void> {
    try {
      const currentVersion = (await this.get<number>(this.VERSION_KEY)) || 0;

      const pendingMigrations = this.migrations.filter(
        (m) => m.version > currentVersion,
      );

      for (const migration of pendingMigrations) {
        console.log(
          `Running storage migration to version ${migration.version}`,
        );
        await migration.migrate();
        await this.set(this.VERSION_KEY, migration.version);
      }

      // Set current version if no migrations were run
      if (pendingMigrations.length === 0 && currentVersion === 0) {
        await this.set(this.VERSION_KEY, this.CURRENT_VERSION);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}
