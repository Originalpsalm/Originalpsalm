# Design & frontend skills

Project-level [Claude Code skills](https://code.claude.com/docs/en/skills), loaded automatically in
every session opened on this repo (local or cloud).

| Skill | Use it for | Source |
| --- | --- | --- |
| `taste-skill` (`design-taste-frontend`) | Anti-slop landing pages, portfolios, redesigns | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) @ `c184364` (MIT) — [tasteskill.dev](https://www.tasteskill.dev/) |
| `image-to-code` | Generate design reference images, then implement them | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/image-to-code-skill/SKILL.md) @ `c184364` (MIT) |
| `web-design-guidelines` | Audit UI code against Vercel's Web Interface Guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) @ `063bee9` |
| `awesome-design` | Fetch a brand-inspired DESIGN.md to build against | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) @ `f696123` (MIT) — fetched on demand, not vendored |
| `playwright-cli` | Drive a real browser: click through, screenshot, test | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) @ `74354ec` (Apache-2.0) |

## Playwright CLI

`@playwright/cli` is a dev dependency, so after `npm ci` it runs as `npx playwright-cli`.
It defaults to the Chrome channel. Where only Playwright's Chromium is installed (e.g. Claude Code
on the web), point it at that build first:

```bash
export PLAYWRIGHT_MCP_BROWSER=chromium
export PLAYWRIGHT_MCP_EXECUTABLE_PATH=/opt/pw-browsers/chromium   # cloud sessions only
npm run dev &                       # then
npx playwright-cli open http://localhost:3000
npx playwright-cli screenshot
```

Session output lands in `.playwright-cli/` (gitignored).

## Updating

Skills are vendored copies. To update one, re-copy its folder from the upstream repo and bump the
commit hash in the table above.
