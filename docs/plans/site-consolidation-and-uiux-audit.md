# Site consolidation + UI/UX audit

**Date:** 2026-07-30
**Scope:** collapse two codebases into one site, and assess `prototype-web` against
the four design pillars (hierarchy/depth, motion, perceived value, performance).

---

## 1. There are not two websites — there are one and a half

`prototype-web` is already the single site: `/` routes to `JourneyPage`, and
nothing routes to the old retail landing. The "two websites" feeling comes from
two places.

### a) A standalone legacy prototype outside the monorepo

`~/Documents/simply-nuts-main` — 2,521 LOC, React + Vite, **not a git repo**, and
still living in iCloud-synced Documents (the location that corrupted this project
twice).

| Piece | LOC | Verdict |
|---|---|---|
| `LaserEngraveHero.tsx` | 373 | **Concept yes, code no.** Framer Motion path-drawing of a laser engraving the wordmark — strong, on-brand idea. But the SVG paths are hand-guessed approximations of the logo, not the real brand wordmark. `prototype-web` already has `LaserHeroAnimation.tsx` covering the same ground. |
| `CustomOrderPage.tsx` + `designStore.ts` | 691 | **Mine for requirements, don't port.** This is the customizer you want heavily reworked. Read it for the field list and flow, then rebuild. |
| `CartDrawer` / `CheckoutPage` | ~400 | **Retire.** Shopify owns cart and checkout per the architecture. Porting these re-creates the split you're trying to remove. |
| `Navbar` / `Footer` / `AboutPage` | ~500 | **Retire.** Superseded. |

**Recommendation:** archive the whole directory into the monorepo as a frozen
reference (alongside the existing `_reference-prototype/` convention), then delete
the iCloud copy. Nothing in it is load-bearing.

### b) Dead code *inside* `prototype-web`

A reachability check found an entire unreachable second site:

| File | LOC | Reachable? |
|---|---|---|
| `pages/HomePage.tsx` | 493 | no — not routed |
| `components/LaserHeroAnimation.tsx` | 241 | only via dead `HeroSection` |
| `components/LaserParticles.tsx` | 158 | no |
| `components/HeroSection.tsx` | 115 | no |
| `FeaturedHarvest`, `ChippyMoment`, `EventsSection`, `SocialProofBand`, `EmailCapture` | — | no |

That is >1,000 lines of a deprecated design language sitting next to the live one.
It is the main reason the codebase reads as two sites.

**Recommendation:** delete, don't quarantine — git already has the history.
*Not done yet: deletion is your call, and `LaserHeroAnimation` has a likely future
home (below).*

### c) Where the laser animation should actually live

You chose a CTA that leads to a combined **quote + customizer** page. That page is
the natural home for the laser engraving beat: it is literally the process being
sold. It should be a scroll section there, not a hero — it competes with the island
for the "first thing you see" slot, and the island won that on differentiation.

---

## 2. Audit against the four pillars

### Visual hierarchy & depth — **was the weakest, now fixed at the top**
- The enlarged island was colliding with the hero headline. Resolved by giving the
  island an entrance: it opens low and slightly small, then rises and grows as the
  harvest ripens. Fixes the collision *and* gives the page an opening beat.
- Glass system is in place and consistent.
- **Open:** the island's base art has a hard straight cut on its left edge, visible
  against light rooms. Asset-level.

### Motion — **was fragmented, now unified**
- Six sections each had their own observer and easing. Replaced with one controller
  (`src/motion/useScrollReveal.ts`) that classifies elements by role and applies one
  motion language, bidirectionally.
- Calibrated to your answer — restrained travel and expo-out easing, with the modern
  note carried by the curve rather than by distance or glow.
- **Fixed a real defect:** both the new and pre-existing reveal systems hid content
  with `opacity: 0` and depended on an IntersectionObserver to restore it. Browsers
  suspend those observers in hidden/prerendering tabs. Unscoped, that ships a blank
  page. Both are now scoped to a runtime class with a 2s failsafe.

### Perceived value & trust
- Product imagery is complete (19/19).
- **Blocked:** the client logo wall. K2 Capital Group, Orijin Stone and Motorwerks
  BMW were read off our own product photography and are **not cleared** as
  endorsements. Written permission required before publishing.
- **Open:** featured products still use the curated static fallback — the live
  Storefront API needs a *public* storefront token.

### Performance
- Tree frames now carry real alpha at 560px: 27MB, versus 24MB for the opaque set
  they replace. Roughly payload-neutral, and it deleted the runtime chroma-key
  shader entirely.
- **Open:** 427 frames is still the dominant cost of the page. Halving the sequence
  to ~31 frames per tree would take it to ~14MB with, at scroll speed, no
  perceptible loss in the ripening animation. Highest-leverage perf win available.
- **Open:** `FloatingIslandHero3D` chunk is 845KB (229KB gzipped). Code-split three
  is possible but it is the hero, so it is on the critical path regardless.

---

## 3. Recommended order of work

1. **Quote + customizer page** — the chosen primary CTA, and the biggest revenue
   lever. Should double as a catalog: browse all container options, templates,
   finished-product photography, and the full website → engraving → shipping story.
2. **Delete the dead code** (§1b) — cheap, and stops the codebase feeling doubled.
3. **Halve the tree sequences** — biggest performance win for the least risk.
4. **Archive and remove `simply-nuts-main`** from iCloud.
5. **Re-export the tree art with real alpha** — would let `bake-tree-alpha.mjs`
   collapse to a resize, and would fix the almond properly rather than by mirror
   reconstruction.

---

## 4. Known reconstructions (not restorations)

The almond canopy is **reconstructed, not fixed**. The source render framed the
tree with its trunk at x=791 of 828, so the right half of the crown was never
rendered — it is literally half a tree, which is what "only half blooming" always
meant. The bake slides it inboard and grafts on a scaled, rotated mirror of its own
canopy. It reads as a full tree at display size, but it is a graft. Regenerated
almond art with the full crown in frame is the real fix and would delete that code
path.
