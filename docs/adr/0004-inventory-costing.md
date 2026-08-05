# ADR-0004 — Inventory costing: weighted average

**Status:** Accepted · **Date:** 2026-08-05

## Context

"Inventory valuation updated automatically" requires a costing method, which
determines the movement ledger's structure. Options: FIFO (cost layers),
weighted average (running average), standard cost (manual + variances).

## Decision

**Weighted average**, per product per warehouse: the average cost is
recalculated on every receipt; issues consume at the current average.

- One cost per product per warehouse — no layer tracking.
- The "Selling Price >= Cost Price unless overridden by permission" rule
  evaluates against the current weighted-average cost.
- COGS on a sale is quantity × average cost at movement time, captured on the
  movement row so history is immune to later cost changes.

## Consequences

- Simpler ledger and code than FIFO; standard for SMB distribution.
- Changing methods later requires a valuation migration — this decision is
  effectively permanent once financial history exists.
