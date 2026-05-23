# Simply Nuts & More — Master Plan

> **Strategy:** Ship the **retail nuts/mixes Shopify store** live FIRST (revenue flowing fast),
> then build the **corporate gifting** experience as a separate Hydrogen storefront.
>
> **Last updated:** 2026-05-23
> **Current date context:** Retail can launch any time. Corporate gifting must be live before
> the **September–December holiday rush** (primary revenue season) — comfortable runway.

---

## Architecture Decision (locked)

| Layer | Approach | Rationale |
|-------|----------|-----------|
| **Retail store** (nuts, chocolates, mixes) | **Shopify native theme** (hosted) | Fastest to live. Shopify handles product pages, cart, checkout, payments, tax, shipping out of the box. |
| **Corporate gifting** (laser-engraved gift containers) | **Custom Hydrogen storefront** (hybrid) | The differentiated tech — logo upload, design preview, CSV recipients — genuinely needs custom code. Built after retail is generating revenue. |
| **Payments** | **Shopify Payments** | Integrated cards / Shop Pay / Apple & Google Pay, tax + payouts. Owner enters banking details. |

---

## Status Legend
`📋 TODO` → `🔄 IN PROGRESS` → `👀 REVIEW` → `✅ DONE`  · 🔵 Owner (non-dev) task · ⛔ Blocker / input needed

---

## Dependency Index

| ID | Status | Owner | Title | Depends | Blocks |
|----|--------|-------|-------|---------|--------|
| ~~TASK-001~~ | ✅ **DONE** | Dev | Phase 1 backend/DB/test/CI foundation committed & pushed | - | - |
| ~~TASK-002~~ | ✅ **DONE** | Dev | Repo hygiene — remove iCloud sync conflict artifacts | - | - |
| TASK-010 | 🔄 **IN PROGRESS** | 🔵 Owner | Finalize retail pricing — 14/18 confirmed; 4 need 2lb/3lb prices | - | TASK-013 |
| TASK-011 | 📋 TODO | 🔵 Owner | Create product photography for each nut & mix | - | TASK-013 |
| TASK-012 | 📋 TODO | 🔵 Owner | Confirm Shopify plan + connect Shopify Payments (banking) | - | TASK-020 |
| TASK-013 | 🔄 **IN PROGRESS** | Dev+Owner | Build full retail catalog — data scraped, import CSV drafted | TASK-010, TASK-011 | TASK-014 |
| TASK-014 | 📋 TODO | Dev | Customize Shopify theme to brand (wood/gold/cream, Manrope, Chippy) | TASK-013 | TASK-021 |
| TASK-015 | 📋 TODO | Dev | Shipping configuration (rates / free-over-threshold) | - | TASK-020 |
| TASK-016 | 📋 TODO | Dev+Owner | Tax configuration (MN + interstate nexus) | - | TASK-020 |
| TASK-017 | 📋 TODO | Dev+Owner | Legal pages: ToS, Privacy, Returns, Shipping policy | - | TASK-020 |
| TASK-018 | 📋 TODO | Dev | Connect Klaviyo + GA4; email capture on storefront | - | TASK-021 |
| TASK-019 | 📋 TODO | 🔵 Owner | Domain/DNS: point simplynutsandmore.com to Shopify | TASK-014 | TASK-020 |
| TASK-020 | 📋 TODO | Dev+Owner | Pre-launch QA + launch checklist (test order end-to-end) | TASK-012,15,16,17,19 | TASK-021 |
| TASK-021 | 📋 TODO | Dev+Owner | 🚀 RETAIL STORE GO-LIVE | TASK-014,18,20 | TASK-030 |
| TASK-030 | 📋 TODO | Dev | Initialize Hydrogen storefront for corporate (real Storefront API) | TASK-021 | TASK-031 |
| TASK-031 | 📋 TODO | Dev | Wire draft-order DB layer (fix better-sqlite3 native build) | TASK-030 | TASK-032 |
| TASK-032 | 📋 TODO | Dev | Corporate customizer: container → logo upload → design preview | TASK-031 | TASK-033 |
| TASK-033 | 📋 TODO | Dev | Recipient list wizard (CSV/XLSX) + draft sharing links | TASK-032 | TASK-035 |
| TASK-034 | 📋 TODO | 🔵 Owner | Container specs, engraving specs, corporate pricing tiers | - | TASK-032 |
| TASK-035 | 📋 TODO | Dev | Klaviyo abandoned-draft flows + CRM webhook for high-intent leads | TASK-033 | TASK-036 |
| TASK-036 | 📋 TODO | Dev+Owner | 🚀 CORPORATE GIFTING GO-LIVE (before Sept) | TASK-035 | - |
| ROAD-040 | 📋 TODO | Dev | Admin order queue + production status tracking | TASK-036 | - |
| ROAD-041 | 📋 TODO | Dev | Reorder templates for returning corporate accounts | TASK-036 | - |
| ROAD-042 | 📋 TODO | Dev | Funnel + retention analytics dashboard | TASK-036 | - |

---

## PHASE 0 — Foundation (✅ COMPLETE)

### ~~TASK-001~~: Phase 1 backend foundation (✅ DONE)
Backend adapter, SQLite DB layer, 118 tests, CI/CD, frontend a11y polish. Committed (`a79734e`) and pushed to `origin/master`. Build verified (1,976 modules, 0 errors).

### ~~TASK-002~~: Repo hygiene (✅ DONE)
Removed iCloud sync-conflict duplicates (" 2"/" 3" files) including artifacts inside `.git` (`master *.lock`, `index *`, stray `.DS_Store`) that were blocking `git push`. `git fsck` clean.

> ⚠️ **Standing risk — iCloud sync:** The repo lives in `~/Documents`, which iCloud Drive syncs.
> iCloud periodically creates conflicted copies *inside* `.git`, which can corrupt git state and
> hang pushes. **Recommendation (TASK-003):** move the repo out of any cloud-synced folder
> (e.g. `~/dev/simply-nuts-next`) or exclude it from iCloud. See "Open Decisions."

---

## PHASE 1 — Retail Shopify Store LIVE 🎯 (PRIORITY)

**Goal:** A customer can browse nuts/chocolates/mixes, add to cart, and check out with real payment.

### TASK-010: Finalize retail pricing 🔵 (🔄 IN PROGRESS — Owner)
**Scraped from live simplynutsandmore.com (2026-05-23) → `docs/RETAIL_CATALOG.md`.**
18 products captured; sizes are 1 / 2 / 3 lb bags. 1 lb prices confirmed for all 18; full
1/2/3 lb pricing confirmed for 14.
- [x] Package sizes confirmed: 1 lb / 2 lb / 3 lb bags
- [x] Per-SKU pricing captured for 14 products
- [ ] ⚠️ Confirm 2 lb / 3 lb prices for 4 products: Honey Roasted Cashews, Roasted Almonds, Chocolate Covered Almonds, Chocolate Covered Cashews
- [ ] Confirm allergen statements per product

### TASK-011: Product photography 🔵 ⛔ (📋 TODO — Owner)
**You are creating these.** One clean product image per nut/mix variety (square, consistent
background). Existing catalog seed (8 varieties in `designStore.ts`): Roasted Almonds, Cashews,
Candied Pecans, Macadamia, Pistachios, Walnuts, Premium Mix, Trail Mix — plus any chocolates.
- [ ] Shoot/produce 1 hero image per SKU (1:1, ~2000px)
- [ ] Optional: 1–2 lifestyle shots per category for collection pages

### TASK-012: Shopify plan + Payments 🔵 ⛔ (📋 TODO — Owner)
- [ ] Confirm Shopify plan (Basic is fine to start)
- [ ] Activate **Shopify Payments** (requires business banking + EIN — **you enter these**)
- [ ] Set payout schedule

### TASK-013: Build retail product catalog in Shopify (🔄 IN PROGRESS — Dev+Owner)
Depends on TASK-010 + TASK-011.
- [x] Catalog data captured → `docs/RETAIL_CATALOG.md` (18 products, descriptions, prices)
- [x] Shopify import file drafted → `db/seed/shopify-products-import.csv` (Size variants, SKUs, weights, collections). Sold-out items (Honey Roasted Cashews, Chocolate Covered Almonds) set to `draft`. The 4 TBC products include only the confirmed 1 lb variant for now.
- [ ] Owner: confirm the 4 TBC bulk prices → add their 2/3 lb rows to the CSV
- [ ] Owner: supply product photos (TASK-011) → add to `Image Src` / upload in admin
- [ ] Import CSV into Shopify; organize Collections (Nuts · Trail Mixes · Chocolates · Best Sellers)
- [ ] Add allergen/ingredient metafields (theme-independent — see TASK-014)

### TASK-014: Theme customization to brand (📋 TODO — Dev)
Depends on TASK-013. Start from Shopify **Dawn** (free) or a Dawn-based **Online Store 2.0** theme.
- [ ] Apply palette (espresso/walnut/copper-gold/pine/cream) + Manrope typography
- [ ] Add Chippy the Squirrel mascot touches
- [ ] Homepage: hero, featured collections, trust badges ("37 years", state-fair), email capture
- [ ] Mobile-first QA

**🔁 Theme portability requirement (must be easy to re-skin / swap later):**
- [ ] Use only **OS 2.0 sections & blocks** + **theme settings** for layout/colors/fonts — do NOT hard-edit Liquid or hardcode content into templates. Re-theming then becomes editor config, not a code rebuild.
- [ ] Keep ALL content in Shopify data, never in theme files: products, descriptions, images, collections, and any extra product attributes (allergens, roast level, ingredients) as **metafields**. Content is theme-independent and survives a theme swap.
- [ ] Brand tokens (colors, fonts, spacing) set via the theme editor (`settings_data.json`), so a future restyle is a settings change.
- [ ] **Duplicate-before-edit** discipline: keep one unmodified copy of the base theme; only ever edit a duplicate. Maintain a short `docs/THEME_CHANGELOG.md` of any custom CSS/section added.
- [ ] Minimize lock-in: avoid apps that inject hardcoded theme snippets; avoid deep custom Liquid forks. Prefer app blocks that detach cleanly.
- [ ] Result: switching to a new theme later = pick theme → re-map sections in editor → content/products/metafields carry over untouched.

### TASK-015: Shipping configuration (📋 TODO — Dev)
- [ ] Decide model: flat rate, free-over-threshold, or carrier-calculated (USPS/UPS)
- [ ] Set package weights per SKU for accurate rates
- [ ] Define shipping zones

### TASK-016: Tax configuration (📋 TODO — Dev+Owner)
- [ ] Enable Shopify automatic tax; set MN origin
- [ ] Confirm nexus states (where you must collect)

### TASK-017: Legal pages (📋 TODO — Dev+Owner)
- [ ] Terms of Service, Privacy Policy, Refund/Return policy, Shipping policy
- [ ] Food-handling/labeling compliance note (MN + interstate)

### TASK-018: Klaviyo + GA4 + email capture (📋 TODO — Dev)
- [ ] Connect Klaviyo to the Shopify store (you have it installed)
- [ ] Welcome flow + abandoned-cart flow (witty brand voice)
- [ ] Install GA4

### TASK-019: Domain / DNS 🔵 (📋 TODO — Owner)
Depends on TASK-014.
- [ ] Point `simplynutsandmore.com` (or `shop.` subdomain) to Shopify
- [ ] Verify SSL

### TASK-020: Pre-launch QA + checklist (📋 TODO — Dev+Owner)
Depends on TASK-012,15,16,17,19.
- [ ] Place a real end-to-end test order (refund after)
- [ ] Verify confirmation email, tax, shipping, receipt
- [ ] Mobile + desktop pass; broken-link sweep

### TASK-021: 🚀 RETAIL STORE GO-LIVE (📋 TODO — Dev+Owner)
Remove password page, announce, monitor first orders.

---

## PHASE 2 — Corporate Gifting (Hydrogen) — after retail is live

### TASK-030: Initialize Hydrogen storefront (📋 TODO — Dev)
The monorepo already scaffolds `apps/storefront-hydrogen`. Wire the real Shopify Storefront API
adapter (already coded in `packages/core/src/commerce/shopifyAdapter.ts`).

### TASK-031: Wire draft-order DB layer (📋 TODO — Dev)
Fix `better-sqlite3` native build (`xcode-select --install` then `npm rebuild`, or Node 20 LTS).
Connect API routes to the SQLite repositories already built in Phase 1.

### TASK-032: Corporate customizer (📋 TODO — Dev)
Depends on TASK-031 + TASK-034. Container select → logo upload → live design preview on lid →
engraving text. Reuse the prototype's 5-step flow.

### TASK-033: Recipient wizard + draft sharing (📋 TODO — Dev)
CSV/XLSX recipient upload, validation, and shareable approval links for buyers.

### TASK-034: Corporate specs & pricing 🔵 ⛔ (📋 TODO — Owner)
Container dimensions/engravable area, file-type rules, bulk tiers (12–24 / 25–49 / 50–99 / 100+),
logo surcharge, lead times. Blocks the customizer build.

### TASK-035: Klaviyo abandoned-draft + CRM webhook (📋 TODO — Dev)
Activate the coded sinks for high-intent corporate leads.

### TASK-036: 🚀 CORPORATE GIFTING GO-LIVE (📋 TODO — Dev+Owner)
Target: **before September** holiday season.

---

## PHASE 3 — Operational Scale (post-launch)
- **ROAD-040** Admin order queue + production status tracking (2-Epilog-machine capacity view)
- **ROAD-041** Reorder templates / pre-loaded past designs for returning accounts
- **ROAD-042** Funnel + retention analytics dashboard

---

## Open Decisions (need owner input)
1. **iCloud risk (TASK-003):** Move repo out of `~/Documents`? (Strongly recommended — caused the push hang.)
2. **Retail packaging:** What sizes/formats are sold at retail (bags, jars, sampler boxes)?
3. **Chocolates:** Are chocolate products part of the initial retail launch, or nuts/mixes only?
4. **Shipping model:** Flat-rate vs free-over-$X vs carrier-calculated?
5. **Domain:** Retail on root `simplynutsandmore.com` or a `shop.` subdomain (keeping room for the corporate Hydrogen app)?

## Immediate Next Steps
1. 🔵 **Owner:** start product images (TASK-011) + finalize retail pricing (TASK-010).
2. 🔵 **Owner:** confirm Shopify plan + activate Shopify Payments (TASK-012).
3. **Dev:** once pricing/images land, bulk-build the catalog (TASK-013) and brand the theme (TASK-014).
4. **Decision:** resolve the iCloud repo-location risk (TASK-003) to avoid future git corruption.
