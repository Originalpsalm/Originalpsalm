# ADR-0005 — Stock reservation at Confirm, movement at Ship

**Status:** Accepted · **Date:** 2026-08-05

## Context

The order lifecycle is Draft → Confirmed → Picking → Packed → Shipped →
Completed, and "cannot exceed available inventory" needs a definition of
*available*. Without reservations, two confirmed orders can claim the same
unit and one fails at shipping (overselling).

## Decision

- Confirming an order **reserves** quantity per product per warehouse.
- `available = onHand − reserved`. The availability check runs against
  `available`, not `onHand`.
- The stock **movement** (ledger entry, COGS capture) is written at **Shipped**.
- Cancelling a confirmed order releases its reservation; no reversal movement
  is needed because no movement was written.
- Backorders (per-tenant setting) allow confirmation below availability;
  negative inventory (per-tenant setting) allows shipping below on-hand.

## Consequences

- The Phase 1 inventory schema includes reservation tracking, even though
  Orders arrive in Phase 2.
- On-hand always reflects physical reality; reserved reflects commitments.
