/**
 * Cross-boundary API contracts (ADR-0007).
 *
 * Every endpoint responds with this envelope — success and failure alike —
 * alongside a real HTTP status code. Never invent a different shape.
 */

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  /** Stable machine-readable error code, e.g. "VALIDATION_ERROR". */
  code: string;
  /** Field-keyed validation messages for form display. */
  errors: Record<string, string[]>;
  /** Present on unexpected (500) errors — quote it when reporting a problem. */
  correlationId?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Standard list payload: `data: { items, pagination }`. */
export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}
