# ADR-0001 — Tenant-scoped data model from day one

**Status:** Accepted · **Date:** 2026-08-05

## Context

The product roadmap targets a commercial multi-tenant SaaS (Phase 6). Retrofitting
tenancy onto a live schema means touching every table, query, index, and endpoint,
and is the most common source of cross-tenant data leaks.

## Decision

- Every business table carries a mandatory, indexed `organizationId` FK.
- Every repository method requires tenant context as an argument — scoping is
  enforced structurally in the data layer (Prisma client extension), not by
  per-query convention.
- Every composite index and unique constraint leads with `organizationId`.
- React Query cache keys are namespaced by organization; the cache is cleared on
  login, logout, and organization switch.
- Roadmap Phase 6 "Multi Tenant" refers to the SaaS *product surface* (signup,
  onboarding, subscriptions, billing) — the data model is tenant-shaped from the
  first migration. Phase 1 runs as a single organization inside it.
- Tenant roles never cross the organization boundary. Platform administration is
  a separate mechanism outside tenant RBAC; every cross-tenant action is audited.
- The Future Architecture hierarchy (Tenant → Branches → Warehouses) reserves a
  `Branch` slot: warehouses attach to the organization now, `branchId` is added
  additively in Phase 5.

## Consequences

- A dedicated tenant-isolation test suite (two seeded orgs, every repository
  method and endpoint asserted) is mandatory for every module.
- Unscoped queries require an explicit, greppable opt-out.
