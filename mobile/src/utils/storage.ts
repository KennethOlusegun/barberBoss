// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Helper Functions
 * 
 * Wrappers around AsyncStorage with error handling and type safety
 */

/**
 * Save data to storage
 */
export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`✅ Saved to storage: ${key}`);
  } catch (error) {
    console.error(`❌ Error saving to storage (${key}):`, error);
    throw error;
  }
};

/**
 * Get data from storage with detailed logging
 */
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);

    if (jsonValue === null) {
      console.log(`ℹ️ No data found in storage: ${key}`);
      return null;
    }

    console.log(`📦 Raw value for ${key}:`, jsonValue);

    // Try to parse as JSON
    try {
      const parsedValue = JSON.parse(jsonValue);
      // Type guard para booleanos salvos como string
      if (typeof parsedValue === 'string' && (parsedValue === 'true' || parsedValue === 'false')) {
        console.warn(`⚠️ Valor booleano salvo como string para ${key}:`, parsedValue);
        return (parsedValue === 'true') as unknown as T;
      }
      console.log(`✅ Retrieved from storage: ${key}`, typeof parsedValue, parsedValue);
      return parsedValue as T;
    } catch (parseError) {
      // Se JSON.parse falhar, retorna string
      console.warn(`⚠️ Could not parse JSON for ${key}, returning raw value`);
      console.log(`Type of raw value:`, typeof jsonValue);
      // Type guard para booleanos salvos diretamente como string
      if (jsonValue === 'true' || jsonValue === 'false') {
        console.warn(`⚠️ Valor booleano salvo como string (raw) para ${key}:`, jsonValue);
        return (jsonValue === 'true') as unknown as T;
      }
      return jsonValue as unknown as T;
    }
  } catch (error) {
    console.error(`❌ Error getting from storage (${key}):`, error);
    return null;
  }
};

/**
 * Remove data from storage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`✅ Removed from storage: ${key}`);
  } catch (error) {
    console.error(`❌ Error removing from storage (${key}):`, error);
    throw error;
  }
};

/**
 * Clear all storage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('✅ Storage cleared');
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    throw error;
  }
};

/**
 * Check if key exists in storage
 */
export const hasKey = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`❌ Error checking key in storage (${key}):`, error);
    return false;
  }
};

/**
 * Get all keys from storage
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log(`✅ Retrieved ${keys.length} keys from storage`);
    return [...keys];
  } catch (error) {
    console.error('❌ Error getting all keys from storage:', error);
    return [];
  }
};

/**
 * Get multiple items from storage
 */
export const getMultipleData = async <T>(
  keys: string[]
): Promise<Record<string, T | null>> => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    
    const result: Record<string, T | null> = {};
    
    values.forEach(([key, value]) => {
      if (value !== null) {
        try {
          result[key] = JSON.parse(value) as T;
        } catch {
          // If parsing fails, store the raw value
          result[key] = value as unknown as T;
        }
      } else {
        result[key] = null;
      }
    });

    console.log(`✅ Retrieved ${keys.length} items from storage`);
    return result;
  } catch (error) {
    console.error('❌ Error getting multiple items from storage:', error);
    return {};
  }
};

/**
 * Save multiple items to storage
 */
export const saveMultipleData = async <T>(
  data: Record<string, T>
): Promise<void> => {
  try {
    const pairs: [string, string][] = Object.entries(data).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
    console.log(`✅ Saved ${pairs.length} items to storage`);
  } catch (error) {
    console.error('❌ Error saving multiple items to storage:', error);
    throw error;
  }
};

/**
 * Remove multiple items from storage
 */
export const removeMultipleData = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
    console.log(`✅ Removed ${keys.length} items from storage`);
  } catch (error) {
    console.error('❌ Error removing multiple items from storage:', error);
    throw error;
  }
};