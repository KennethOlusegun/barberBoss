/**
 * Common Types
 *
 * Shared types used across the application
 */

/**
 * Pagination Response
 *
 * Generic paginated response structure
 */
export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Response
 *
 * Standard API response wrapper
 */
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Query Parameters
 *
 * Base query parameters for list endpoints
 */
export interface IQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Date Range
 *
 * Represents a date range
 */
export interface IDateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Time Range
 *
 * Represents a time range
 */
export interface ITimeRange {
  startTime: string;
  endTime: string;
}

/**
 * ID Parameter
 *
 * Common ID parameter type
 */
export type ID = string | number;

/**
 * Nullable
 *
 * Makes a type nullable
 */
export type Nullable<T> = T | null;

/**
 * Optional
 *
 * Makes all properties of a type optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Timestamp
 *
 * Represents a timestamp (Date or string)
 */
export type Timestamp = Date | string;

/**
 * Status Type
 *
 * Common status values
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * Error Response
 *
 * Standard error response structure
 */
export interface IErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}
