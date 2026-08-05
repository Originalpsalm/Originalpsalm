# ADR-0010 — Testing: tooling in the foundation, isolation suites mandatory

**Status:** Accepted · **Date:** 2026-08-05

## Context

The testing spec sets coverage goals and PR gates but lists its own tooling as
"future". Gates cannot run without a runner, and retrofitting tests onto
finished modules costs far more than writing them alongside.

## Decision

- **Vitest** (unit: services, repositories, validators, utilities),
  **Testing Library** (forms, dialogs, states), **Playwright** (critical-path
  E2E + post-deploy smoke), `@axe-core/playwright` (WCAG AA checks).
  Cypress is dropped — one E2E framework.
- Integration tests run against **real Postgres** (Docker locally, service
  container in CI) — partial unique indexes, constraints, and cascades cannot
  be exercised by mocks.
- **Tenant-isolation suite is mandatory per module**: two seeded organizations;
  every repository method and endpoint asserted unable to read/update/delete
  across the boundary. Generated from the module registry so a module cannot
  ship without it.
- Permission checks are table-driven from the permission registry (7 roles ×
  ~200 permissions is too large to hand-write).
- Every bug fix lands with a regression test. Every business rule in the specs
  maps to a named test. Coverage percentages are health signals, not merge
  gates.

## Consequences

- Test infrastructure ships with the foundation; the first module establishes
  the test pattern all modules copy.
