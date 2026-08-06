# Changelog

All notable changes to the Psalm Creations Business Suite are recorded here.

Format: [Keep a Changelog](https://keepachangelog.com) · Versioning: [SemVer](https://semver.org)

Every completed feature, release, breaking change, migration, and deployment
must be recorded here — and only after it has actually shipped.

## [Unreleased]

### Added

- PostgreSQL 16 + Prisma 7 database layer: driver-adapter client singleton,
  first migration (`organization` table per ADR-0001, NGN base currency)
- `AppError` taxonomy mapped to HTTP statuses 400/401/403/404/409/422 (ADR-0007)
- Standard response envelope helpers and `handleRoute` error boundary
  (sanitized 500s with correlation IDs)
- Structured JSON logger with automatic redaction of sensitive keys
- `GET /api/v1/health` — liveness + database reachability (200 / 503)
- Vitest unit test suite wired into CI (error taxonomy, envelope, boundary)

## [0.0.1] — 2026-08-05

### Added

- Project foundation: Next.js 16, React 19, TypeScript (strict), TailwindCSS v4
- Semantic design token system (light + dark, WCAG AA status pairs, Inter)
- ESLint standards: no `any`, no `ts-ignore`, no `console` outside the logger
- Conventional commit enforcement (commitlint)
- GitHub Actions CI: typecheck, lint, build, commit message validation
- Pull request template per Git Workflow specification
- Engineering documentation: ADRs 0001–0010 and the consolidated decision register
