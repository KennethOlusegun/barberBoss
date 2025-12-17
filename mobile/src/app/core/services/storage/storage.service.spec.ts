import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Preferences } from '@capacitor/preferences';
import { StorageKey } from './storage.types';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);

    // Setup spies for Capacitor Preferences
    spyOn(Preferences, 'set').and.returnValue(Promise.resolve());
    spyOn(Preferences, 'get').and.returnValue(Promise.resolve({ value: null }));
    spyOn(Preferences, 'remove').and.returnValue(Promise.resolve());
    spyOn(Preferences, 'clear').and.returnValue(Promise.resolve());
    spyOn(Preferences, 'keys').and.returnValue(Promise.resolve({ keys: [] }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set', () => {
    it('should store data successfully', async () => {
      await service.set('test.key', 'test value');

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'test.key',
        value: jasmine.any(String),
      });
    });

    it('should store data with StorageKey enum', async () => {
      await service.set(StorageKey.ACCESS_TOKEN, 'token123');

      expect(Preferences.set).toHaveBeenCalledWith({
        key: StorageKey.ACCESS_TOKEN,
        value: jasmine.any(String),
      });
    });

    it('should store data with TTL', async () => {
      const ttl = 3600000; // 1 hour

      await service.set('test.key', 'test value', { ttl });

      expect(Preferences.set).toHaveBeenCalled();
      const callArgs = (Preferences.set as jasmine.Spy).calls.mostRecent()
        .args[0];
      const storedData = JSON.parse(callArgs.value);

      expect(storedData.expiresAt).toBeDefined();
      expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should store complex objects', async () => {
      const complexObject = {
        id: '123',
        name: 'Test User',
        settings: { theme: 'dark', notifications: true },
      };

      await service.set('user.data', complexObject);

      expect(Preferences.set).toHaveBeenCalled();
      const callArgs = (Preferences.set as jasmine.Spy).calls.mostRecent()
        .args[0];
      const storedData = JSON.parse(callArgs.value);

      expect(storedData.value).toEqual(complexObject);
    });

    it('should handle errors gracefully', async () => {
      (Preferences.set as jasmine.Spy).and.returnValue(
        Promise.reject(new Error('Storage error')),
      );

      await expectAsync(service.set('test.key', 'value')).toBeRejectedWithError(
        'Storage error',
      );
    });
  });

  describe('get', () => {
    it('should retrieve stored data successfully', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.get('test.key');

      expect(result).toBe('test value');
      expect(Preferences.get).toHaveBeenCalledWith({ key: 'test.key' });
    });

    it('should return null for non-existent keys', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: null }),
      );

      const result = await service.get('non.existent');

      expect(result).toBeNull();
    });

    it('should return null for expired data', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now() - 10000,
        expiresAt: Date.now() - 5000, // Expired 5 seconds ago
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.get('expired.key');

      expect(result).toBeNull();
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'expired.key' });
    });

    it('should return data that has not expired', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000, // Expires in 10 seconds
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.get('valid.key');

      expect(result).toBe('test value');
    });

    it('should retrieve complex objects', async () => {
      const complexObject = {
        id: '123',
        name: 'Test User',
        settings: { theme: 'dark' },
      };
      const storedData = {
        value: complexObject,
        timestamp: Date.now(),
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.get('user.data');

      expect(result).toEqual(complexObject);
    });

    it('should handle JSON parse errors', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: 'invalid json' }),
      );

      const result = await service.get('invalid.key');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove data successfully', async () => {
      await service.remove('test.key');

      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'test.key' });
    });

    it('should remove data using StorageKey enum', async () => {
      await service.remove(StorageKey.ACCESS_TOKEN);

      expect(Preferences.remove).toHaveBeenCalledWith({
        key: StorageKey.ACCESS_TOKEN,
      });
    });
  });

  describe('clear', () => {
    it('should clear all data successfully', async () => {
      await service.clear();

      expect(Preferences.clear).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should return true if key exists', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.has('test.key');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: null }),
      );

      const result = await service.has('non.existent');

      expect(result).toBe(false);
    });

    it('should return false for expired keys', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
        expiresAt: Date.now() - 1000,
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.has('expired.key');

      expect(result).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return all storage keys', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      (Preferences.keys as jasmine.Spy).and.returnValue(
        Promise.resolve({ keys: mockKeys }),
      );

      const result = await service.keys();

      expect(result).toEqual(mockKeys);
    });

    it('should return empty array on error', async () => {
      (Preferences.keys as jasmine.Spy).and.returnValue(
        Promise.reject(new Error('Keys error')),
      );

      const result = await service.keys();

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return storage statistics', async () => {
      const mockKeys = ['key1', 'key2'];
      (Preferences.keys as jasmine.Spy).and.returnValue(
        Promise.resolve({ keys: mockKeys }),
      );

      let callCount = 0;
      (Preferences.get as jasmine.Spy).and.callFake(() => {
        callCount++;
        return Promise.resolve({ value: `value${callCount}` });
      });

      const stats = await service.getStats();

      expect(stats.itemCount).toBe(2);
      expect(stats.keys).toEqual(mockKeys);
      expect(stats.estimatedSize).toBeGreaterThan(0);
    });
  });

  describe('removeByPrefix', () => {
    it('should remove all items with matching prefix', async () => {
      const allKeys = ['cache.user', 'cache.posts', 'settings.theme'];
      (Preferences.keys as jasmine.Spy).and.returnValue(
        Promise.resolve({ keys: allKeys }),
      );

      await service.removeByPrefix('cache.');

      expect(Preferences.remove).toHaveBeenCalledTimes(2);
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'cache.user' });
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'cache.posts' });
    });
  });

  describe('getRaw', () => {
    it('should return raw stored data with metadata', async () => {
      const storedData = {
        value: 'test value',
        timestamp: 1234567890,
        expiresAt: 9876543210,
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.getRaw('test.key');

      expect(result).toEqual(storedData);
    });

    it('should return null for non-existent keys', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: null }),
      );

      const result = await service.getRaw('non.existent');

      expect(result).toBeNull();
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired data', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.isExpired('test.key');

      expect(result).toBe(false);
    });

    it('should return true for expired data', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
        expiresAt: Date.now() - 1000,
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.isExpired('test.key');

      expect(result).toBe(true);
    });

    it('should return false for data without expiration', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      const result = await service.isExpired('test.key');

      expect(result).toBe(false);
    });

    it('should return true for non-existent data', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: null }),
      );

      const result = await service.isExpired('non.existent');

      expect(result).toBe(true);
    });
  });

  describe('refreshTTL', () => {
    it('should refresh TTL for existing data', async () => {
      const storedData = {
        value: 'test value',
        timestamp: Date.now(),
      };
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: JSON.stringify(storedData) }),
      );

      await service.refreshTTL('test.key', 5000);

      expect(Preferences.set).toHaveBeenCalled();
      const callArgs = (Preferences.set as jasmine.Spy).calls.mostRecent()
        .args[0];
      const newStoredData = JSON.parse(callArgs.value);

      expect(newStoredData.expiresAt).toBeDefined();
    });

    it('should not throw error for non-existent keys', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: null }),
      );

      await expectAsync(
        service.refreshTTL('non.existent', 5000),
      ).toBeResolved();
    });
  });

  describe('initialize', () => {
    it('should initialize without errors', async () => {
      (Preferences.get as jasmine.Spy).and.returnValue(
        Promise.resolve({ value: null }),
      );
      (Preferences.keys as jasmine.Spy).and.returnValue(
        Promise.resolve({ keys: [] }),
      );

      await expectAsync(service.initialize()).toBeResolved();
    });
  });
});
