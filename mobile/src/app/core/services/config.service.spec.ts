import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('API Configuration', () => {
    it('should return API URL with prefix', () => {
      const apiUrl = service.getApiUrl();
      expect(apiUrl).toContain('/api');
    });

    it('should return API base URL', () => {
      const baseUrl = service.getApiBaseUrl();
      expect(baseUrl).toBeTruthy();
    });

    it('should build endpoint URL correctly', () => {
      const endpoint = service.buildEndpointUrl('/users');
      expect(endpoint).toContain('/users');
      expect(endpoint).toContain('/api');
    });

    it('should build endpoint URL without leading slash', () => {
      const endpoint = service.buildEndpointUrl('users');
      expect(endpoint).toContain('/users');
    });

    it('should return API timeout', () => {
      const timeout = service.getApiTimeout();
      expect(timeout).toBeGreaterThan(0);
    });
  });

  describe('Authentication Configuration', () => {
    it('should return token key', () => {
      const tokenKey = service.getTokenKey();
      expect(tokenKey).toBeTruthy();
    });

    it('should return refresh token key', () => {
      const refreshTokenKey = service.getRefreshTokenKey();
      expect(refreshTokenKey).toBeTruthy();
    });

    it('should return token expiration time', () => {
      const expirationTime = service.getTokenExpirationTime();
      expect(expirationTime).toBeGreaterThan(0);
    });
  });

  describe('Application Configuration', () => {
    it('should return app name', () => {
      const appName = service.getAppName();
      expect(appName).toBe('Barber Boss');
    });

    it('should return app version', () => {
      const version = service.getAppVersion();
      expect(version).toBeTruthy();
    });

    it('should return default language', () => {
      const language = service.getDefaultLanguage();
      expect(language).toBeTruthy();
    });

    it('should return supported languages', () => {
      const languages = service.getSupportedLanguages();
      expect(Array.isArray(languages)).toBeTruthy();
      expect(languages.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Flags', () => {
    it('should check debug mode', () => {
      const isDebug = service.isDebugModeEnabled();
      expect(typeof isDebug).toBe('boolean');
    });

    it('should check analytics', () => {
      const isAnalytics = service.isAnalyticsEnabled();
      expect(typeof isAnalytics).toBe('boolean');
    });

    it('should check push notifications', () => {
      const isPushEnabled = service.arePushNotificationsEnabled();
      expect(typeof isPushEnabled).toBe('boolean');
    });

    it('should check offline mode', () => {
      const isOffline = service.isOfflineModeEnabled();
      expect(typeof isOffline).toBe('boolean');
    });

    it('should check specific feature flag', () => {
      const isEnabled = service.isFeatureEnabled('enableDebugMode');
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('Storage Configuration', () => {
    it('should return storage prefix', () => {
      const prefix = service.getStoragePrefix();
      expect(prefix).toBeTruthy();
    });

    it('should return storage type', () => {
      const type = service.getStorageType();
      expect(['localStorage', 'indexedDB']).toContain(type);
    });

    it('should return prefixed storage key', () => {
      const key = service.getStorageKey('test');
      expect(key).toContain('test');
      expect(key.startsWith(service.getStoragePrefix())).toBeTruthy();
    });
  });

  describe('Business Configuration', () => {
    it('should return default appointment duration', () => {
      const duration = service.getDefaultAppointmentDuration();
      expect(duration).toBeGreaterThan(0);
    });

    it('should return min advance booking', () => {
      const minAdvance = service.getMinAdvanceBooking();
      expect(minAdvance).toBeGreaterThanOrEqual(0);
    });

    it('should return max advance booking', () => {
      const maxAdvance = service.getMaxAdvanceBooking();
      expect(maxAdvance).toBeGreaterThan(0);
    });

    it('should return cancellation deadline', () => {
      const deadline = service.getCancellationDeadline();
      expect(deadline).toBeGreaterThanOrEqual(0);
    });
  });

  describe('UI Configuration', () => {
    it('should return default theme', () => {
      const theme = service.getDefaultTheme();
      expect(['light', 'dark', 'auto']).toContain(theme);
    });

    it('should check animations', () => {
      const areAnimationsEnabled = service.areAnimationsEnabled();
      expect(typeof areAnimationsEnabled).toBe('boolean');
    });

    it('should return items per page', () => {
      const itemsPerPage = service.getItemsPerPage();
      expect(itemsPerPage).toBeGreaterThan(0);
    });
  });

  describe('Utility Methods', () => {
    it('should get configuration by path', () => {
      const baseUrl = service.get('api.baseUrl');
      expect(baseUrl).toBeTruthy();
    });

    it('should return undefined for invalid path', () => {
      const value = service.get('invalid.path.test');
      expect(value).toBeUndefined();
    });

    it('should get entire config', () => {
      const config = service.getConfig();
      expect(config).toBeTruthy();
      expect(config.api).toBeTruthy();
      expect(config.auth).toBeTruthy();
    });

    it('should check production mode', () => {
      const isProduction = service.isProduction();
      expect(typeof isProduction).toBe('boolean');
    });
  });
});
