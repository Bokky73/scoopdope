/**
 * Common utility types shared across the platform.
 * @module common.types
 */

/**
 * Standard paginated API response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API success response wrapper.
 */
export interface ApiResponse<T = void> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API error response.
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic sort direction.
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Common pagination query parameters.
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * UUID string type alias for clarity.
 */
export type UUID = string;

/**
 * ISO 8601 datetime string type alias.
 */
export type ISODateString = string;
