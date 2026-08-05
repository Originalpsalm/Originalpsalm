# ADR-0003 — Per-tenant partial unique indexes

**Status:** Accepted · **Date:** 2026-08-05

## Context

Three mandated features collide: unique constraints (email, sku, barcode,
invoiceNumber, customerCode…), universal soft deletes, and multi-tenancy.
A soft-deleted row keeps occupying a plain unique index (blocking re-creation
forever), and global uniqueness lets tenant A's data block tenant B's.

## Decision

Uniqueness is enforced per tenant, ignoring soft-deleted rows, via raw-SQL
migrations (Prisma schema language cannot express partial indexes):

```sql
CREATE UNIQUE INDEX customer_email_unique
  ON "Customer" ("organizationId", email)
  WHERE "deletedAt" IS NULL;
```

Related conventions:

- Mandatory audit columns on every business table: `createdAt`, `updatedAt`,
  `deletedAt`, plus actor fields `createdById`, `updatedById`, `deletedById`,
  plus `organizationId`.
- Phone uniqueness applies to a normalized E.164 column (default region NG,
  +234) stored alongside the display value.
- Posted financial documents (invoices, payments, credit notes) are exempt from
  soft delete: they are voided or reversed, never deleted. Drafts may be
  deleted.
- Text-search columns use `pg_trgm` GIN indexes (raw SQL) — B-tree indexes do
  not accelerate `%substring%` search.
- Raw SQL is sanctioned only for: partial unique indexes, trigram indexes,
  report/dashboard aggregations, materialized views — and only via
  tagged-template `$queryRaw` (never `$queryRawUnsafe`).

## Consequences

- Migrations mixing Prisma DDL and raw SQL are the standard pattern.
- Unique-violation behavior must be integration-tested against real Postgres.
