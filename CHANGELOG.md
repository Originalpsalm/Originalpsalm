# Changelog

All notable changes are recorded here.

Format: [Keep a Changelog](https://keepachangelog.com) · Versioning: [SemVer](https://semver.org)

Every completed feature, release, breaking change, migration, and deployment
must be recorded here — and only after it has actually shipped.

## [Unreleased]

### Added

- Green-X Farm investor platform — ten static routes covering opportunities,
  the project pipeline, the development roadmap, track record, how to invest,
  about, contact and an investor room preview
- Content layer in `content/` so all copy and deal data is editable without
  touching components
- `flags.showSampleDeals` — a single switch that hides every placeholder
  closed round site-wide, including its detail route
- Scroll reveal via CSS scroll-driven animations, with no state in which
  content can be left invisible
- Class-based dark mode with a pre-paint inline script and a header toggle

### Changed

- Design tokens retargeted from the indigo ERP palette to the Green-X palette
  (forest green, tomato accent, harvest gold on a warm paper canvas)
- Root layout now carries the site header, footer and the Inter + Plus Jakarta
  Sans pairing

## [0.0.1] — 2026-08-05

### Added

- Project foundation: Next.js 16, React 19, TypeScript (strict), TailwindCSS v4
- Semantic design token system (light + dark, WCAG AA status pairs, Inter)
- ESLint standards: no `any`, no `ts-ignore`, no `console` outside the logger
- Conventional commit enforcement (commitlint)
- GitHub Actions CI: typecheck, lint, build, commit message validation
- Pull request template per Git Workflow specification
- Engineering documentation: ADRs 0001–0010 and the consolidated decision register
