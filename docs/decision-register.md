# Decision Register

Consolidated resolutions of every conflict, gap, and open question found while
incorporating the 21 specification documents. ADRs cover the load-bearing
decisions; this register records everything else so nothing lives only in
conversation history. **Documentation is the source of truth — when a spec and
this register conflict, stop and resolve explicitly.**

## Architecture

| Topic | Decision |
|---|---|
| Canonical layer chain | Repository → Service → Validation → API → React Query → Hooks → Components → Pages. Tables/Dialogs/Forms are component categories inside the Components layer. |
| Server Components | Render shells/layouts/static chrome; may prefetch into the React Query cache (hydration). All mutations and interactive data via REST + React Query. No Server Actions. |
| Route handlers | Thin HTTP adapters at `app/api/v1/**` — parse, authenticate, delegate, serialize. Business logic lives in `backend/<module>/service.ts`. |
| Backend module shape | Flat files per module: `constants.ts`, `mapper.ts`, `repository.ts`, `service.ts`, `types.ts`, `validator.ts` (Implementation Blueprint). |
| Types | Root `types/` holds cross-boundary contracts only (envelope, errors, pagination, session). Module types live in `backend/<module>/types.ts`. Entity types derive from Prisma; input types from `z.infer`. Never a third hand-written copy. |
| Validators | Pure Zod, zero imports from Prisma/repositories/services — the only part of `backend/` shared with the client (forms reuse the schemas). Enforced by lint boundary. |
| Reports/Dashboard | Read-model pattern (ADR-0008). |
| Frontend homes | `components/ui/*` primitives, `components/<module>/*` business components, `hooks/<module>/*`, pages in `app/`. |
| Hooks naming | `useCustomers(params)` list · `useCustomer(id)` single · `useCreate/useUpdate/useDelete<Entity>()`. |
| Global client state | Sanctioned only: session context, current organization, theme. Everything else is React Query or local state. |

## Database

| Topic | Decision |
|---|---|
| Primary keys | UUID v4 (per Database Architecture spec), app-generated. |
| Mandatory columns | `organizationId`, `createdAt`, `updatedAt`, `deletedAt`, `createdById`, `updatedById`, `deletedById`. |
| Uniqueness | ADR-0003 partial composite indexes. |
| Money | `Decimal(19,4)` unit prices/rates · `Decimal(19,2)` totals · arithmetic via Prisma Decimal, never JS numbers · `currencyCode` on every financial record from day one (base currency **NGN**). |
| Document numbers | Per-tenant sequence table, row-locked. Financial numbers assigned at posting (inside the posting transaction), never at draft. |
| Phone | Normalized E.164 column (default region NG) for uniqueness; display value stored as typed. |
| Search | `pg_trgm` GIN indexes; every index leads with `organizationId`. |
| Status transitions | Explicit state machines in services — never scattered conditionals. |
| Postgres | Dev/CI on 16; production ≥ 16. |

## API

Per ADR-0007. Correlation IDs on all error responses; full detail server-side.

## Auth & security

Per ADR-0002. Additionally: CSRF tokens + `SameSite` on state-changing routes
(cookie-based auth is CSRF-exposed); audit logging is one cross-cutting service
(actor, tenant, entity, action, diff) invoked from services; permissions are
data (registry + per-tenant roles; the 7 named roles are seeded templates);
platform admin is separate from tenant RBAC (ADR-0001).

## UI

| Topic | Decision |
|---|---|
| Brand | Deep Indigo per Design System spec (previous build's green retired — user-confirmed). Slate dark mode. Semantic tokens only; no literal colors in components. |
| Tailwind | v4, CSS-first `@theme`. |
| Status colors | fg/bg pairs, each AA-verified; badges always carry icon or label (color-independent status). |
| Table vs DataGrid | `Table` = presentational primitive. `DataGrid` = TanStack-powered feature component (search, sort, filter, paginate, column visibility, selection, bulk actions, skeleton, empty state; CSV export deferred per Implementation Blueprint). |
| Mobile tables | Priority-ranked columns; hide progressively, stacked card layout at mobile widths, row expansion. No horizontal page scroll. |
| Dialogs | Buttons grouped bottom-right (Cancel left of primary), matching the named benchmark products. |
| Query keys | Org-namespaced factory: `['org', orgId, module, view, params]`; full cache clear on auth/org change. |
| Component docs | JSDoc + `docs/` reference (no Storybook). |
| Navigation IA | Dashboard · Customers · Products · Inventory · Quotations · Orders · Invoices · Finance · Reports · Settings (carried from previous build). |

## Dependencies (authorized)

Sonner (spec-mandated) · TanStack Table/Query, RHF, Zod, Base UI, Lucide
(spec-mandated) · Recharts (dashboard charts) · react-day-picker (date picker;
Base UI has none) · argon2 (argon2id hashing) · commitlint ·
`@axe-core/playwright` · Vitest/Playwright/Testing Library (ADR-0010).
PDF + email libraries chosen at Phase 2 planning.

## Deferred (with owners)

| Item | When |
|---|---|
| Tax model (jurisdiction, line vs doc, inclusive/exclusive, historical rates) | Specify at Phase 2 planning — Phase 1 schema keeps a nullable tax-category slot on Product; likely first model: Nigerian VAT 7.5%. |
| Discounts (line/document, %/fixed) | Phase 2 planning. |
| Overpayment handling | Recommended: accept + unapplied credit. Hard block only as per-tenant setting. Decide with Payments module. |
| CSV export | DataGrid extension point built; feature per Implementation Blueprint "future". |
| Branch entity | Phase 5 — additive (`branchId` on Warehouse). |
| Refresh-token rotation | Optimization after auth ships (ADR-0002). |
| Custom fields | Phase 5 — JSONB strategy. |
| Virus scanning, Redis cache, OpenTelemetry stack | Per spec "future" markers. |

## Process

npm (spec-mandated) · Conventional commits + commitlint · PR template with
mandated sections · module completion = Database + Backend + Frontend + CRUD +
Testing + Documentation + Build + Git · per-feature definition of done: build
passes → app runs → feature verified → tests pass → commit → push.

## Build order (per roadmap Phase 1)

Foundation → Auth → Users/Roles/Permissions → Settings (core) → Categories →
Brands → Units → Products → Customers → Suppliers → Warehouses → Inventory →
Dashboard (shell + KPIs).
