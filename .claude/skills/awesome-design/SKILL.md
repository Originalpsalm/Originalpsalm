---
name: awesome-design
description: Pull a ready-made DESIGN.md (colors, typography, spacing, component rules) inspired by a well-known product's design language from VoltAgent/awesome-design-md, and use it as the design system for a page or app. Use when the user says "make it look like Stripe/Linear/Vercel/Apple…", asks for a DESIGN.md, or wants a consistent visual language to build against.
argument-hint: <brand>
---

# Awesome DESIGN.md

[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT) is a curated set of
`DESIGN.md` files: plain-markdown design systems (YAML front matter with color, type, radius and spacing
tokens, followed by prose rules for components and layout) that describe the visual language of a real product.

## How to use

1. Pick the brand. If the user did not name one, suggest 2–3 that fit the brief from the list below.
2. Fetch it fresh from GitHub (do not guess its contents):

   ```
   https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<brand>/DESIGN.md
   ```

   Use WebFetch, or `curl -sSL <url> -o DESIGN.md` when the user wants it saved to the project.
3. Build against its tokens: map the colors, type scale, radii and spacing into the project's
   Tailwind v4 theme (`@theme` in the global CSS) or CSS variables, then follow its component rules.
4. Treat it as *inspiration*. Never copy a company's logo, wordmark, proprietary fonts or trademarked
   names into this product; substitute open fonts (Google Fonts) with a similar feel.
5. Pair with the `taste-skill` for layout/composition and `web-design-guidelines` to audit the result.

## Available brands

airbnb airtable apple binance bmw bmw-m bugatti cal claude clay clickhouse cohere coinbase composio cursor dell-1996 elevenlabs expo ferrari figma framer hashicorp hp ibm intercom kraken lamborghini linear.app lovable mastercard meta minimax mintlify miro mistral.ai mongodb nike nintendo-2001 notion nvidia ollama opencode.ai pinterest playstation posthog raycast renault replicate resend revolut runwayml sanity sentry shopify slack spacex spotify starbucks stripe supabase superhuman tesla theverge together.ai uber vercel vodafone voltagent warp webflow wired wise x.ai zapier
