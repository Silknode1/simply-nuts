# Shopify Retail Store — Setup & Launch Guide

> Operational companion to `MASTER_PLAN.md` (Phase 1). Get the retail nuts/mixes/chocolates
> store live on **Shopify** (commerce) with **Shopify Payments**, behind the **custom React
> landing page** as the marketing homepage (Option B hybrid). Catalog data is ready in
> `db/seed/shopify-products-import.csv` and `docs/RETAIL_CATALOG.md`.
>
> **Hybrid layout:** `simplynutsandmore.com` (root) = custom React landing page on Netlify ·
> `shop.simplynutsandmore.com` = Shopify store (catalog/cart/checkout). Landing-page "Shop" CTAs
> hand off to Shopify (links or embedded Buy Buttons).
>
> **Legend:** 🔵 Owner action (account/banking/photos/domain) · 🛠️ Dev/configurable

---

## Order of operations (fastest path to live)

1. 🔵 **Account & plan** — confirm Shopify plan (Basic is fine to launch). Store: `simply-nuts-and-more-main.myshopify.com`.
2. 🔵 **Shopify Payments** — Settings → Payments → activate. Requires business/banking details + EIN (you enter these). Set payout schedule.
3. 🛠️ **Import catalog** — Products → Import → upload `db/seed/shopify-products-import.csv`. 18 products × 3 size variants. Sold-out items import as **draft** (Honey Roasted Cashews, Chocolate Covered Almonds).
4. 🛠️ **Collections** — create: **Nuts**, **Trail Mixes**, **Chocolates**, **Best Sellers**. Use automated collections by Product Type (already set in the CSV) + tag `Best Seller` for Butter Toffee Peanuts.
5. 🔵 **Product photos** — upload one image per product (TASK-011). Square ~2000px, consistent background.
6. 🛠️ **Theme** — install **Dawn** (free, OS 2.0) → duplicate → customize the duplicate (see Brand spec below). Note: the Shopify theme powers product/collection/cart/checkout pages; the *homepage* is your React landing page (step 6b).
6b. 🛠️ **Landing page** — trim the React prototype to marketing-only (remove mock cart/checkout), point "Shop" CTAs to the Shopify store, and deploy to **Netlify** (`npm run build:prototype` → publish `apps/prototype-web/dist`). Optionally embed **Shopify Buy Buttons** for inline add-to-cart.
7. 🛠️ **Shipping** — Settings → Shipping. Variant weights are pre-set (1lb=454g, 2lb=907g, 3lb=1361g) for carrier-calculated rates; or flat-rate / free-over-threshold.
8. 🛠️🔵 **Taxes** — Settings → Taxes. Enable automatic tax; MN origin; confirm collection states (nexus).
9. 🛠️ **Legal pages** — Settings → Policies: generate Refund, Privacy, ToS, Shipping (Shopify has templates; customize).
10. 🛠️ **Klaviyo + GA4** — connect Klaviyo (already installed); add GA4. Welcome + abandoned-cart flows.
11. 🔵 **Domain split** — point `simplynutsandmore.com` (root) → Netlify landing page; `shop.simplynutsandmore.com` → Shopify store. Verify SSL on both.
12. 🛠️🔵 **QA + launch** — test order end-to-end, refund it, then remove the storefront password.

---

## Brand spec for the theme (matches the existing prototype)

Set these in the theme editor → **Theme settings** (colors/typography) so re-skinning later is a
settings change, not code (see theme-portability requirement, MASTER_PLAN TASK-014).

### Colors
| Role | Hex | Token name (prototype) |
|------|-----|------------------------|
| Primary CTA / buttons | `#c45e20` | burn |
| CTA hover (dark) | `#8b3a0f` | burn-dark |
| Headings / dark text | `#3d2410` | wood-900 |
| Body text | `#1d1612` | ink |
| Page background | `#fdf8f0` | cream / wood-50 |
| Card border | `#e8d9c7` | card-border |
| Secondary / success accent | `#3d8b3d` | forest-500 |
| Gold accent (badges, highlights) | `#d4a017` | gold-500 |
| Deep espresso (footer/contrast) | `#24160f` | espresso |

### Typography
- **Headings:** Playfair Display (serif) — elegant, premium
- **Body / UI:** Manrope (fallback Inter, system-ui) — clean, modern
- Load via Shopify's font picker or `<link>` to Google Fonts in `theme.liquid` head.

### Voice (for any theme copy / banners)
Warm, family-run, witty. "Anti-boring corporate gift" energy. Use "we"/"our". See
`docs/SIMPLY_NUTS_CONTEXT.md` §6 for the full voice guide.

---

## Homepage = your React landing page (Option B)
The marketing homepage is the custom React landing page (already built), not a Dawn homepage. The
Shopify theme's homepage can stay minimal/unused. The structure below is a reference for the
landing page + the Shopify **collection** pages that the "Shop" CTAs link into:
1. **Announcement bar** — free shipping threshold or seasonal note
2. **Hero** — lifestyle shot + "Freshly roasted, family-crafted for 37 years" + CTA → Shop Nuts
3. **Featured collection** — Best Sellers (Butter Toffee Peanuts, Jumbo Cashews…)
4. **Collection list** — Nuts · Trail Mixes · Chocolates (image cards)
5. **Rich text / trust** — "37 years," Minnesota State Fair heritage, family story
6. **Newsletter signup** — wired to Klaviyo
7. **Footer** — policies, contact, social links

---

## Pre-launch QA checklist
- [ ] Place a real end-to-end test order; confirm email, tax, shipping, receipt; refund it
- [ ] Each product: correct price per size, image, description, in/out-of-stock state
- [ ] Mobile + desktop pass; cart + checkout flow; broken-link sweep
- [ ] Policies present and linked in footer
- [ ] Klaviyo welcome + abandoned-cart flows firing
- [ ] GA4 receiving events
- [ ] Domain resolves with valid SSL
- [ ] Remove storefront password → announce

---

## What I (Claude) can do vs. what needs you
**I can do / draft:** catalog CSV (done), product descriptions (done), collection structure,
theme brand settings spec (above), homepage section copy, policy page drafts, Klaviyo flow copy.
**You must do:** create/confirm Shopify account, activate Shopify Payments (banking), upload
product photos, point the domain. (Account creation, payments, and banking are owner-only by policy.)
