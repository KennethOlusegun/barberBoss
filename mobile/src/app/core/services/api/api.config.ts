/**
 * API Configuration Constants
 * Default configuration values for the API service
 */

/**
 * Default API configuration
 */
export const API_CONFIG = {
  /** Default request timeout (30 seconds) */
  DEFAULT_TIMEOUT: 30000,

  /** Default number of retry attempts */
  DEFAULT_RETRY_ATTEMPTS: 3,

  /** Default delay between retries (1 second) */
  DEFAULT_RETRY_DELAY: 1000,

  /** Maximum number of queued requests for offline mode */
  MAX_QUEUED_REQUESTS: 50,

  /** HTTP status codes that should trigger a retry */
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],

  /** HTTP methods that are safe to retry (idempotent) */
  RETRYABLE_METHODS: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'],
};

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
  },
  // Add more endpoint groups as needed
};

/**
 * HTTP headers constants
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  X_REQUEST_ID: 'X-Request-ID',
};

/**
 * Content type constants
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
};
