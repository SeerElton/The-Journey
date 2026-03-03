/**
 * TypeScript interfaces for API responses
 */

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  traceId: string;
}

export interface ValidationError {
  errors: string[];
}
