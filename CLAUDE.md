# Simply Nuts & More — Prototype Storefront

## Project Overview
Simply Nuts & More is a family-run premium nut gifting company (since 1987) building a modern e-commerce storefront focused on **corporate gifting with custom laser engraving**. This repo is the React/Vite prototype.

**Mascot:** Chippy the chipmunk
**Brand assets:** `/Users/danielcarney/Documents/SimplyNuts - Misc Pics - Website/`

## Tech Stack
- React 19 + TypeScript
- Vite 7 (build tool)
- Tailwind CSS v4
- Zustand (state management)
- React Router v7
- Framer Motion (animations)
- Fabric.js (canvas/engraving customizer)
- Lucide React (icons)

## Project Root
`/Users/danielcarney/Documents/simply-nuts-main/`

## Key Directories & Files
```
src/
  App.tsx              — Router setup, root layout
  main.tsx             — Entry point
  index.css            — Global styles
  pages/
    HomePage.tsx        — Landing page with hero, features, product preview, testimonials
    ProductsPage.tsx    — Product catalog
    CheckoutPage.tsx    — Checkout flow
    CustomOrderPage.tsx — Custom/corporate order flow
    AboutPage.tsx       — About the business
    ContactPage.tsx     — Contact form
  components/
    Navbar.tsx          — Top navigation
    Footer.tsx          — Site footer
    CartDrawer.tsx      — Slide-out cart
    LaserEngraveHero.tsx — Hero with engraving animation
  store/
    index.ts            — Zustand store (cart state, etc.)
public/                 — Static assets
```

## Three Core User Paths
1. **Corporate Gifting Studio** — Bulk orders, logo engraving, direct-to-recipient shipping
2. **Retail Ecommerce** — Individual product purchases
3. **Events / Markets** — State fair and events presence

## Product Types
- Wooden Gift Box (from $24.99) — walnut-finished, brass hinges
- Bamboo Container (from $19.99) — eco-friendly
- Gift Tin (from $14.99) — brushed metal with custom lid engraving

## Brand Pillars
- Heritage with Heart (family business since 1987)
- Premium Without Pretension
- Custom Made Easy (guided workflows, not email ping-pong)
- Human Support, Always

## Dev Commands
```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Relationship to Next-Gen Repo
This prototype feeds into `simply-nuts-next` (`/Users/danielcarney/Documents/simply-nuts-next/`), which is the monorepo targeting **Shopify Hydrogen** for production. Components and patterns built here get migrated there.

## Motion / Animation Rules
- Lightweight motion globally; heavy 3D only in the customizer
- Respect `prefers-reduced-motion` at all times
- Use `opacity` and `transform` — avoid layout-thrashing animations
- Framer Motion is the standard animation library

## Workflow Rules
- Always read existing component files before suggesting modifications
- Check `src/store/index.ts` before adding new state
- When building new pages, follow the existing pattern in `src/pages/`
- Run `npm run build` to catch TypeScript errors before declaring work complete
