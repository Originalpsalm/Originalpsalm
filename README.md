# Green-X Farm — Investor Platform

An investor-facing platform for Green-X Farm: open investment opportunities,
the project pipeline, the phased development roadmap, track record and a
preview of the reporting participants receive.

Content is derived from the *Green-X Farm 2.0 Revised Master Plan* and the
*Universal Tomato Funding Proposal* (August 2026).

## Stack

Next.js 16 · React 19 · TypeScript (strict) · TailwindCSS v4 ·
Inter + Plus Jakarta Sans

Fully static — every route prerenders. There is no database, no auth and no
server-side state.

## Pages

| Route | Purpose |
|---|---|
| `/` | Overview, headline figures, featured rounds, philosophy, roadmap and pipeline |
| `/opportunities` | All rounds grouped by open / upcoming / pipeline / closed |
| `/opportunities/[slug]` | Round detail — budget, assumptions, timeline, KPIs, risks |
| `/projects` | The project pipeline and the strategic crop architecture |
| `/roadmap` | Phase 0–V, the ₦400m capital threshold, locations, research gaps, 2031 vision |
| `/track-record` | Closed rounds and their reported outcomes |
| `/invest` | Instruments, process, reporting cadence and FAQ |
| `/about` | Story, founders, governance, philosophy, risk framework, impact |
| `/contact` | Enquiry form (composes an email — no backend) |
| `/portal` | Investor room preview — reporting format demonstration |

## Editing content

All copy and data live in `content/` as plain TypeScript. No component changes
are needed to update the site.

| File | Contains |
|---|---|
| `content/site.ts` | Organisation details, navigation, headline stats, philosophy, locations, **content flags** |
| `content/opportunities.ts` | Every investment round — budgets, assumptions, KPIs, risks, outcomes |
| `content/projects.ts` | Project pipeline and crop architecture |
| `content/roadmap.ts` | Development phases, capital threshold, financial discipline, research gaps, 2031 vision |
| `content/investing.ts` | Instruments, process, reporting cadence, FAQ, assurances |
| `content/about.ts` | Story, founders, governance, risk framework, impact |
| `content/portal.ts` | Investor room preview data |

### Sample deals

Some closed rounds in `content/opportunities.ts` are marked `isSample: true`.
They exist **only** to demonstrate how a completed round is presented, and they
render with a visible "Sample" badge plus an explicit warning on the
opportunities and track-record pages.

They are controlled by a single flag in `content/site.ts`:

```ts
export const flags = {
  showSampleDeals: true,
};
```

Set it to `false` and every sample entry disappears from the whole site,
including its detail route. **Do not present sample entries to investors as
real closed rounds** — replace them with genuine rounds and turn the flag off.

The one genuinely closed entry (`GX-T00`, the founders' self-funded trial) is
not a sample and stays visible either way.

## Design system

Semantic design tokens are defined once in `app/globals.css` — light and dark
palettes, surfaces, text, borders, brand and status colours. Components
reference tokens (`bg-surface`, `text-text-secondary`, `border-border-subtle`)
and never literal colours, so retheming is a single-file change.

Dark mode is class-based on `<html>`, applied before first paint by a small
inline script in the root layout and toggled from the header.

Scroll reveal uses CSS scroll-driven animations (`animation-timeline: view()`)
with no JavaScript. Where unsupported, or when the reader prefers reduced
motion, content simply renders normally — it can never be left invisible.

## Not yet built

- Real investor authentication (`/portal` is a static preview; its access code
  is published on the page deliberately, because it protects nothing)
- A backend for the enquiry form — it currently composes an email. The field
  names in `components/contact/enquiry-form.tsx` are already the payload shape
  for a future API route.
- Real imagery. The site is currently typographic and illustrative only.

## Development

```bash
npm install
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

## Disclaimer

Nothing in this project constitutes an offer of securities or investment
advice. Yield, price and revenue figures throughout are conservative planning
assumptions from the Green-X business plan, not guarantees or forecasts.
