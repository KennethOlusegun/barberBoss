/**
 * Authentication Configuration
 *
 * Contains configuration constants for the authentication service.
 */

/**
 * API endpoints for authentication
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  RESET_PASSWORD: '/auth/reset-password',
  RESET_PASSWORD_CONFIRM: '/auth/reset-password-confirm',
} as const;

/**
 * Storage keys for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'barber_boss_token',
  REFRESH_TOKEN: 'barber_boss_refresh_token',
  USER: 'barber_boss_user',
  TOKEN_EXPIRY: 'barber_boss_token_expiry',
} as const;

/**
 * Authentication configuration options
 */
export const AUTH_CONFIG = {
  TOKEN_HEADER_KEY: 'Authorization',
  TOKEN_PREFIX: 'Bearer',
  TOKEN_REFRESH_THRESHOLD: 300, // 5 minutes before expiry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 100,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: false,
  REQUIRE_NUMBER: false,
  REQUIRE_SPECIAL_CHAR: false,
} as const;
