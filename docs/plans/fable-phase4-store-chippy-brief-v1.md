# Fable Brief — Phase 4: Liquid-Glass Store + Chippy on the Island (v1)

**For:** Fable (frontend build agent)
**Repo:** `simply-nuts-next` monorepo
**Depends on:** the R3F island hero you already shipped (`apps/prototype-web/src/components/FloatingIslandHero3D.tsx`, route `/island`)
**Date:** 2026-07-14

---

## What's decided (don't re-litigate)

1. **Homepage = the 3D island journey, wrapped in warm liquid glass.** The R3F floating-island scroll hero you built is the front door. The old retail landing UI is deprecated (see project CLAUDE.md, 2026-07-08).
2. **Journey is homepage-only.** Collections and product pages are standard, glass-styled Shopify pages — calm and product-forward. No scroll-scrubbing to shop.
3. **Real products, light architecture.** Feed real products into the homepage via the **Shopify Storefront API**. Actual shopping (collections + PDP) stays **native Shopify**. Checkout is Shopify-hosted. Do NOT build checkout, payments, tax, or fulfillment.
4. **Corporate gifting page v1 = showcase, not tool.** Past-products gallery + a horizontal auto-scrolling client-logo marquee + the existing inquiry form (`ContactPage`). The full logo-upload customizer is **Phase 2 — out of scope here.**
5. **Island critters (not the mascot).** Two generic photoreal chipmunks chasing each other around the island — running, leaping, pausing to nibble, and ducking behind trees before reappearing. Ambient wildlife, no connection to the Chippy mascot. Movement is procedural (see workstream 4); the video clips are just the motion vocabulary.

---

## Warm liquid glass — the visual language

Liquid glass = `backdrop-filter: blur() saturate()` panels + hairline gradient borders + a subtle inner top highlight. The brand twist: **warm, not iOS-cold.** Tint the glass toward the existing Tailwind v4 `@theme` tokens (wood / gold / cream), so panels read like frosted amber, not silver.

**Performance guardrails (non-negotiable, per `docs/motion-system-v1.md`):**
- Blur the *panels only*, never a full-screen layer over the R3F canvas.
- Cap or disable `backdrop-filter` on mobile.
- `prefers-reduced-motion` fallback: static glass, no parallax, no autoplay.

---

## PASTE THIS TO FABLE

> **Phase 4 build — liquid-glass store shell + Chippy integration.**
>
> Build on the R3F island hero you already shipped (`FloatingIslandHero3D.tsx`, route `/island`). Four workstreams:
>
> **1. Warm liquid-glass design system.** Add a small set of reusable glass primitives (panel, nav bar, card, pill/CTA) using `backdrop-filter: blur() saturate()`, hairline gradient borders, and a soft inner top highlight. Tint toward the wood/gold/cream `@theme` tokens so the glass reads warm-amber, not cold-silver. Blur panels only — never full-screen over the canvas. Cap blur on mobile. Honor `prefers-reduced-motion` (static glass, no parallax). Apply this language across nav, hero overlays, cards, and footers.
>
> **2. Homepage as the front door.** Make the island journey the homepage (`/`), not a side route. As an overture beat near the end of the scroll, park the island to one side and bloom in a small set of **real featured products pulled from the Shopify Storefront API** on the other side (a short "breathing" reveal — a few cards, glass-framed). End the homepage with a clear "Shop all" CTA into the native Shopify collections. Keep the reveal to the homepage only; do not turn browsing into a scroll-scrub.
>
> **3. Corporate gifting page (v1 — showcase, no customizer).** Build a page with: (a) a **gallery of past engraved products** (photos — laser-engraved wooden boxes, bamboo containers, gift tins); (b) a **horizontal, infinitely auto-scrolling marquee of past-client logos** (pause on hover, reduced-motion → static row); (c) a CTA into the existing corporate inquiry form (`ContactPage`). No upload tool — that's Phase 2. Leave a clearly marked mount point / section stub where the customizer will later drop in.
>
> **4. Chipmunks on the island (ambient wildlife).** Two generic photoreal chipmunks chasing each other around the island. The MP4s in `apps/prototype-web/brand-src/` are a **motion vocabulary, not routes** — Fable owns all movement. Clips: (1) a seamless **run loop** (running in place, body centered), (2) a **leap** (one arc), (3) an **idle / nibble / look-around** loop, (4) an **alert / peek** beat for emerging from cover. Build a **procedural choreography layer**: move each critter along randomized waypoint paths across the island surface, playing the run loop while translating position, horizontal-flipping for direction, firing the leap on gap-crossings and sharp turns, and dropping to idle when it pauses. Randomize speed, pause length, and path per critter so it never reads as a canned loop; critter B trails A to sell the chase. **Hide/reappear:** route critters *behind* the tree billboards' depth planes so they disappear behind a tree, dwell (idle) for a randomized beat, then peek/dart back out — this is z-order routing, mostly free, and it's what makes them feel alive. Composite with correct depth against the existing `roots.webp` / `surface.webp` layers. Subtle, non-distracting; freeze to a static critter or hide entirely on `prefers-reduced-motion`.
>
> **Boundaries:** Real products via Storefront API only; native Shopify for collections/PDP/checkout. Nothing Shopify-specific in `packages/core` (keep it adapter-agnostic). New shared types → `packages/types`, business logic → `packages/core`. Never store source/master assets under any `dist/` — assets live in `apps/prototype-web/brand-src/`. Run `npm run typecheck` before declaring done.

---

## Asset dependencies (I'm handling these)

- **Chipmunk clips (motion vocabulary) — ✅ DELIVERED:** four keyable clips in `apps/prototype-web/brand-src/chipmunks/` — `run.mp4` (treadmill loop), `leap.mp4` (one arc), `idle.mp4` (nibble/look-around loop), `peek.mp4` (rear-up alert). All 960×960, 24fps, ~5s, photoreal chipmunk, side profile facing right, flat chroma green ≈ **#009440**. Keying + choreography notes in `brand-src/chipmunks/README.md`; source first-frames (2048² PNG) in `brand-src/chipmunks/frames/`. Generated on Atlas Cloud (Seedream v5.0 Pro stills → Kling v3.0 Std image-to-video).
- **Gallery photos:** the engraved-box product shots (e.g. the Salisbury-style boxes) → `apps/prototype-web/brand-src/gallery/`.
- **Client logos (marquee):** real client wordmark/logo files (SVG preferred, PNG ok) → `apps/prototype-web/brand-src/clients/`. **You need to supply these** — the marquee can't populate itself.

## Deferred to Phase 2 (note for Fable, don't build yet)

Full logo-upload customizer: upload (PNG/SVG/PDF live; AI/EPS/CDR via an upload-for-proof lane) → live **"as-engraved"** monochrome-burn-on-wood preview → layout/text/template composer (konva.js) → downloadable proof + production vector, wired into the existing draft-order state machine.
