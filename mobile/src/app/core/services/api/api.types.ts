/**
 * API Types and Interfaces
 * Defines common types used across the API layer
 */

/**
 * HTTP Methods supported by the API
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * API Request configuration options
 */
export interface ApiRequestOptions {
  /** Custom headers for the request */
  headers?: Record<string, string>;

  /** Query parameters */
  params?: Record<string, any>;

  /** Request timeout in milliseconds (overrides default) */
  timeout?: number;

  /** Whether to include authentication token */
  requiresAuth?: boolean;

  /** Whether to retry the request on failure */
  retry?: boolean;

  /** Number of retry attempts */
  retryAttempts?: number;

  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;

  /** Custom error handler for this request */
  errorHandler?: (error: ApiError) => void;

  /** Report upload/download progress */
  reportProgress?: boolean;

  /** Response type */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;

  /** HTTP status code */
  status: number;

  /** Status message */
  message?: string;

  /** Response metadata */
  meta?: {
    /** Current page (for paginated responses) */
    page?: number;

    /** Items per page */
    perPage?: number;

    /** Total items */
    total?: number;

    /** Total pages */
    totalPages?: number;
  };
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> {
  /** Array of items */
  data: T[];

  /** Pagination metadata */
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Error structure
 */
export interface ApiError {
  /** HTTP status code */
  status: number;

  /** Error code (application-specific) */
  code?: string;

  /** Error message */
  message: string;

  /** Detailed error information */
  details?: any;

  /** Original error object */
  originalError?: any;

  /** Timestamp of the error */
  timestamp?: string;
}

/**
 * Error codes used by the API
 */
export enum ApiErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server errors (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Application errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  CANCELLED = 'CANCELLED',
}

/**
 * Request queue item for offline support
 */
export interface QueuedRequest {
  id: string;
  url: string;
  method: HttpMethod;
  body?: any;
  options?: ApiRequestOptions;
  timestamp: number;
  retries: number;
}
