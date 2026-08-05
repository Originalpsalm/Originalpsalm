# ADR-0006 — GDPR erasure via anonymization

**Status:** Accepted · **Date:** 2026-08-05

## Context

"GDPR Ready" conflicts with soft-delete-everything and immutable audit logs:
personal data would be retained indefinitely, including historical values in
the audit trail. Meanwhile tax law requires financial records to be retained —
so erasure cannot mean deleting transactions.

## Decision

- **Transactional records** (invoices, orders, payments, stock movements) are
  retained under legal obligation and never erased.
- **Personal data** (name, email, phone, address) is erasable via
  **anonymization**: PII fields are overwritten with tombstones on an erasure
  request, preserving referential and financial integrity.
- Audit-log entries for the erased subject have their old/new value snapshots
  redacted. This is the single sanctioned exception to "audit logs are never
  edited," documented here.
- PII columns are explicitly identified per table from the first migration so
  the anonymization routine is complete by construction.

## Consequences

- An `anonymize` operation per PII-bearing entity, permission-gated and audited.
- Reports and history keep working against tombstoned records.
