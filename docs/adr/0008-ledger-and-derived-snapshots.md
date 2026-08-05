# ADR-0008 — Ledger as source of truth; derived, rebuildable snapshots

**Status:** Accepted · **Date:** 2026-08-05

## Context

"Inventory valuation / cash flow updated automatically" conflicts with "never
store calculated totals — aggregate instead." Pure aggregation cannot hold the
< 1s dashboard target once movements reach real volume; independently
maintained totals drift and cannot be trusted.

## Decision

- The stock movement ledger (and financial document tables) are the sole source
  of truth. Ledger rows are never edited.
- Valuation, cash flow, and dashboard figures are **derived**. Where live
  aggregation is too slow, a **rebuildable snapshot** (materialized view or
  balance record) is used — explicitly marked as a cache, reconstructible and
  reconcilable from the ledger at any time.
- No value is ever independently written that the ledger could contradict.
- Reports/Dashboard use a **read-model pattern**: dedicated query services own
  their aggregate SQL beside repositories — entity repositories stay clean.
- Large report generation runs as background work: a Postgres queue table
  processed via scheduled invocation (Vercel Cron) initially; the execution
  venue sits behind an interface so a dedicated worker can replace it.

## Consequences

- Snapshot rebuild + reconciliation jobs are part of the finance/inventory
  modules, not afterthoughts.
