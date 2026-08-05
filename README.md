# Psalm Creations Business Suite

Enterprise business management platform — sales, inventory, and finance in one
suite. Built as a commercial-grade, multi-tenant-ready ERP.

## Stack

Next.js 16 · React 19 · TypeScript (strict) · PostgreSQL · Prisma ·
TailwindCSS v4 · Base UI · TanStack Table & Query · React Hook Form · Zod

## Architecture

Modular layered architecture — every module follows the same chain:

```
Repository → Service → Validation → API → React Query → Hooks → Components → Pages
```

| Folder | Responsibility |
|---|---|
| `app/` | Pages, layouts, route handlers (`app/api/v1/**`) |
| `backend/` | Business logic: repositories, services, validators, mappers |
| `components/` | `ui/` primitives · `<module>/` business components |
| `hooks/` | React Query hooks per module |
| `lib/` | Prisma, auth, logger, API helpers, formatting |
| `prisma/` | Schema, migrations, seed |
| `types/` | Cross-boundary contracts (envelope, errors, pagination) |
| `docs/` | ADRs, decision register, engineering documentation |

Key decisions are recorded as ADRs in [`docs/adr/`](docs/adr/) and the
[decision register](docs/decision-register.md).

## Development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Quality gates (all must pass before commit):

```bash
npm run typecheck
npm run lint
npm run build
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org)
(enforced by commitlint in CI).

## Versioning

SemVer. Current: **0.0.1** (foundation). Changes are recorded in
[CHANGELOG.md](CHANGELOG.md) — only after they actually ship.
