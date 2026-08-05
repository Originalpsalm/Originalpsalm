# ADR-0009 — Deployment topology: Vercel + managed Postgres

**Status:** Accepted · **Date:** 2026-08-05

## Context

The deployment spec names Vercel as primary hosting (Docker/Railway as
alternatives) with managed Postgres. Serverless constrains filesystems,
long-running work, and database connections.

## Decision

- **Vercel** hosts the app; **managed Postgres** (Neon / Supabase / Railway /
  RDS) with **connection pooling mandatory**: `DATABASE_URL` (pooled) for
  runtime, `DIRECT_DATABASE_URL` for migrations.
- **Migrations run from CI only** (`prisma migrate deploy` gated on the
  production deploy) — never in the Vercel build step, where concurrent/preview
  builds could touch the wrong database.
- **File uploads use object storage** (Cloudflare R2 recommended, S3-compatible)
  with signed URLs — the serverless filesystem is ephemeral; nothing is ever
  stored in `public/`. Required with the Expenses module, not later.
- **Background jobs**: Postgres queue table + scheduled invocation initially
  (see ADR-0008); behind an interface so a dedicated worker can replace it.
- CI is GitHub Actions: typecheck, lint, build, tests (with a Postgres service
  container), commit-message validation. Deployment gates per the spec:
  build → tests → preview → approval → production.
- Structured logging only (no `console.*` outside `lib/logger.ts`); secrets via
  environment variables only; `/api/v1/health` for monitoring.

## Consequences

- Local development uses Docker/system Postgres 16; production Postgres must be
  ≥ 16 (features used are tested against 16).
