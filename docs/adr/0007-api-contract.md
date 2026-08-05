# ADR-0007 — API contract: versioned REST, envelope, error codes

**Status:** Accepted · **Date:** 2026-08-05

## Context

The API spec defines the response envelope and status codes but leaves
pagination shape, machine-readable errors, DELETE semantics, and update
semantics open. These must be identical across every module.

## Decision

- All routes mount at **`/api/v1/`** from day one ("version ready" is cheapest
  when actually versioned; a public API is planned).
- Real HTTP status codes (400/401/403/404/409/422/500) **plus** the envelope in
  the body. React Query and monitoring depend on status codes.
- Success: `{ success: true, message, data }`. Lists:
  `data: { items: T[], pagination: { page, pageSize, total, totalPages } }`.
- Failure: `{ success: false, message, code, errors }` — `code` is a stable
  machine-readable string; `errors` holds field-keyed validation messages.
- Error taxonomy: `ValidationError → 400`, `AuthenticationError → 401`,
  `PermissionError → 403`, `NotFoundError → 404`, `ConflictError → 409`,
  `BusinessRuleError → 422`, unexpected → 500 (sanitized, correlation ID
  attached; full detail logged server-side).
- **PATCH** for partial updates (the ERP norm); PUT only for genuine full
  replacement. **DELETE returns 200 with the envelope** (204 cannot carry the
  mandated body; soft delete isn't "no content").
- Owned children nest one level (`/api/v1/orders/{id}/items`); independent
  lifecycles get top-level modules.
- Mappers are invoked at the **API layer** — the single serialization boundary.
  `deletedAt`, `organizationId`, password hashes, and internal columns never
  reach a client.
- Repositories normalize ORM errors (P2002, P2025…) into neutral infrastructure
  errors; services convert them into `AppError` with business meaning.

## Consequences

- One response shape, one error taxonomy, one client for all modules.
