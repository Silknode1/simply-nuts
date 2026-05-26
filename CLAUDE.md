# Simply Nuts Next — Production Monorepo

## Project Overview
This is the next-generation monorepo for Simply Nuts & More, targeting a phased migration from the React/Vite prototype to **Shopify Hydrogen** (Remix-based SSR). Corporate gifting with custom laser engraving is the primary revenue channel.

**North Star:** Turn manual gifting coordination into a repeatable, low-friction ordering system.

## Project Root
`/Users/danielcarney/Documents/simply-nuts-next/`

## Tech Stack
- **Monorepo:** npm workspaces
- **Prototype app:** React + TypeScript + Vite
- **Production target:** Shopify Hydrogen (Remix)
- **Shared packages:** TypeScript-first, framework-agnostic

## Two-codebase split (monorepo)
- **`apps/prototype-web`** = the RETAIL + LANDING codebase. The shared marketing front door
  (deployed to Netlify at the root domain). Marketing only — retail commerce runs on Shopify;
  "Shop" CTAs link out via `src/config.ts` (`SHOP_URL` / `SHOP_COLLECTIONS`). No cart/checkout here.
- **`apps/storefront-hydrogen`** = the CORPORATE GIFTING codebase (Shopify Hydrogen). The old
  corporate React prototype lives under `_reference-prototype/` (frozen, NOT built) for porting.
- **`packages/core · types · ui`** = shared business logic / types / UI used by both.

## Directory Structure
```
apps/
  prototype-web/          — Retail marketing landing page (React + Vite). Shared front door.
    src/
      App.tsx             — Router + layout shell (Navbar, Footer; routes: / /about /contact)
      main.tsx            — Entry point
      config.ts           — SHOP_URL + SHOP_COLLECTIONS (Shopify handoff links)
      styles.css          — Landing CSS + Tailwind v4 @theme tokens (wood/gold/cream/burn)
      components/         — Navbar, Footer, HeroSection, LaserHeroAnimation, EmailCapture, etc.
      pages/
        HomePage.tsx      — Retail-forward landing with animated laser-engraving hero
        AboutPage.tsx     — Brand story / heritage
        ContactPage.tsx   — Corporate gifting inquiry form
  storefront-hydrogen/    — Corporate gifting (Hydrogen). _reference-prototype/ = frozen corp prototype

packages/
  types/                  — Shared domain types (DraftOrder, Product, etc.)
  core/
    src/
      commerce/
        types.ts          — CommerceAdapter interface
        mockAdapter.ts    — Mock implementation for prototype
      customizer/
        schemas.ts        — Zod schemas for customizer state
        stateMachine.ts   — Draft order state machine (reducer pattern)
      events/
        types.ts          — Event definitions
        dispatcher.ts     — Event bus
        sinks/
          consoleSink.ts
          klaviyoSink.ts  — Klaviyo email marketing integration
          crmSink.ts      — Internal CRM webhook
  ui/                     — Shared reusable React components

db/
  migrations/             — SQL migrations for draft order tables
    0002_draft_orders.sql

docs/
  brand-ux-strategy-v1.md    — Brand positioning and UX principles
  landing-experience-v2.md   — Landing page implementation notes
  motion-system-v1.md        — Animation rules and guardrails
  mvp-backlog.md             — Prioritized feature backlog (P0–P3)
  brand-assets-manifest.md   — Asset catalog
```

## Draft Order State Machine
States (in order): `anonymous_draft` → `identified_draft` → `verified_draft` → `checkout_ready` → `submitted_order` → `in_review` → `in_production` → `shipped`

Key rules:
- Email capture required to move past `anonymous_draft`
- Email verification required before `checkout_ready`
- Transitions are strict — invalid transitions throw

## MVP Backlog (from docs/mvp-backlog.md)
**P0 — Foundation**
- Initialize Hydrogen app under `apps/storefront-hydrogen`
- Implement shared Shopify adapter in `packages/core`
- API routes: draft creation, autosave, email capture, verification
- DB access layer + migrations runner

**P1 — Customizer Workflow**
- 5-step customizer UI with autosave state machine
- Design asset upload + validation
- Recipient upload wizard (CSV/XLSX)
- Draft sharing links for approvers

**P2 — Automation + Growth**
- Klaviyo event wiring (abandoned draft flows)
- Internal CRM webhook sink
- Blog/campaign content scaffolding

**P3 — Operational Scale**
- Internal order queue statuses
- Customer-facing status tracking
- Reorder templates for returning accounts
- Analytics dashboard

## Dev Commands
```bash
npm run setup            # Install all workspace deps (run after package.json changes)
npm run dev:prototype    # Run the prototype app (http://localhost:5173)
npm run typecheck        # TypeScript check across all packages
npm run build:prototype  # Build prototype (verified working — 1975 modules, 0 errors)
```

## Event System
The event dispatcher (`packages/core/src/events/`) fans out to multiple sinks:
- `consoleSink` — dev logging
- `klaviyoSink` — email marketing triggers (Klaviyo profile + event creation)
- `crmSink` — internal CRM webhook for high-intent leads

## CommerceAdapter Interface
All commerce operations go through `CommerceAdapter` (defined in `packages/core/src/commerce/types.ts`). Currently using `mockAdapter` in prototype. Will be replaced with real Shopify Storefront API adapter in Hydrogen.

## Workflow Rules
- Read `docs/mvp-backlog.md` to understand priorities before starting new features
- New shared types go in `packages/types`, business logic in `packages/core`
- Do NOT add Shopify-specific code to `packages/core` — keep it adapter-agnostic
- Always run `npm run typecheck` before declaring work complete
- Event tracking: new user actions should emit events through the dispatcher

## Relationship to Prototype Repo
The working prototype at `/Users/danielcarney/Documents/simply-nuts-main/` feeds patterns into this monorepo. When migrating components, place shared ones in `packages/ui`.
