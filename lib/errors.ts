/**
 * Application error taxonomy (ADR-0007).
 *
 * Services throw these; the API layer converts them into the response
 * envelope with the matching HTTP status. Repositories never throw business
 * errors — they normalize ORM failures, and services translate those into
 * an AppError with business meaning.
 */

interface AppErrorOptions {
  status: number;
  code: string;
  errors?: Record<string, string[]>;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: Record<string, string[]>;

  constructor(message: string, options: AppErrorOptions) {
    super(message);
    this.name = new.target.name;
    this.status = options.status;
    this.code = options.code;
    this.errors = options.errors ?? {};
  }
}

/** 400 — the request shape or field values are invalid. */
export class ValidationError extends AppError {
  constructor(message = "Validation failed.", errors?: Record<string, string[]>) {
    super(message, { status: 400, code: "VALIDATION_ERROR", errors });
  }
}

/** 401 — no valid session. */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication required.", code = "AUTHENTICATION_REQUIRED") {
    super(message, { status: 401, code });
  }
}

/** 403 — authenticated, but not permitted to perform this action. */
export class PermissionError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, { status: 403, code: "PERMISSION_DENIED" });
  }
}

/** 404 — the record does not exist (or is soft-deleted / out of tenant scope). */
export class NotFoundError extends AppError {
  constructor(message = "The requested record was not found.", code = "NOT_FOUND") {
    super(message, { status: 404, code });
  }
}

/** 409 — the request conflicts with existing state (e.g. duplicate value). */
export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT", errors?: Record<string, string[]>) {
    super(message, { status: 409, code, errors });
  }
}

/** 422 — the request is well-formed but violates a business rule. */
export class BusinessRuleError extends AppError {
  constructor(message: string, code: string) {
    super(message, { status: 422, code });
  }
}
