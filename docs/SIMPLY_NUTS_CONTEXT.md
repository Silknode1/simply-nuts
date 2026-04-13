# Simply Nuts & More — Project Context File

> **Purpose:** Drop this file into a Claude.ai Project or paste it at the start of a new conversation to give a fresh AI assistant full context on the business, the website being built, and the non-development tasks that need to happen before launch.
>
> **Last updated:** March 8, 2026

---

## 1. Business Overview

**Simply Nuts & More** is a family-run specialty food company based in **Chanhassen, Minnesota**. They've been in business for approximately **37 years (est. ~1987)**. The business specializes in **premium roasted nuts, chocolates, and custom mixes** — but the real differentiator is their **corporate holiday gifting service**.

### What they sell
- **Laser-engraved gift containers** filled with premium nuts, chocolates, and mixes
- Three container types: **Wooden Boxes**, **Bamboo Containers**, and **Gift Tins**
- Each comes in multiple sizes (small, medium, large)
- The lid of every container is **custom laser-engraved** with the client's corporate logo or design
- The containers are then filled with the customer's choice of nuts/chocolates/mixes and shipped directly to the customer's clients

### Container details
| Container Type | Sizes | Approx Capacity |
|---------------|-------|-----------------|
| Wooden Box | Small (1 lb), Medium (2 lb), Large (4 lb) | 2, 4, or 8 half-pound bags |
| Bamboo Container | Small, Medium | 1–2 bags (1 lb total) |
| Gift Tin | Small, Medium, Large | Configurable inserts (3-section or single cavity) |

### How the process works today (manual workflow)
1. Corporate client contacts Simply Nuts (usually via email or phone)
2. Client provides their logo and selects container type + nut varieties
3. Back-and-forth emails to finalize the design and proof the engraving
4. Logo is vectorized in **CorelDRAW** and sent to the laser machines
5. **2 Epilog laser engraving machines** run simultaneously to engrave container lids
   - Wooden boxes: only **6 lids per machine per run**, each run takes **30+ minutes**
   - This is the biggest production bottleneck
6. While lids engrave, team weighs and bags nuts/chocolates/mixes
7. Assembly: bags go into containers, decorative holiday paper fills extra space (wooden boxes), lids go on
8. Each container is placed in an individual cardboard shipping box
9. Individual shipping labels are printed (FedEx/UPS picks up daily)
10. Shipping is charged at cost to the client

### Business model
- **Primary revenue:** Holiday season (September–December) corporate gifting
- **Target customers:** HR managers, office managers, founders, and executive assistants ordering gifts for their company's clients, employees, or partners
- **Typical order sizes:** 12–500+ units per corporate client
- **Revenue drivers:** Container selection + nut selection + laser engraving + shipping
- **Current pricing structure (placeholders — needs real numbers):**
  - Wooden boxes: ~$25–$60 depending on size
  - Bamboo: ~$20–$50
  - Gift tins: ~$15–$40
  - Nut prices: $1.20–$2.50/oz (need per-pound pricing)
  - Logo surcharge: $5.00 flat (needs confirmation)

### Brand personality
- **Warm, family-oriented, and approachable** — but with a witty edge
- Anti-boring-corporate-gift positioning: "Your clients deserve better than a generic fruitcake"
- Mascot: **Chippy the Squirrel** — playful, appears throughout the website
- Color palette: earthy tones — espresso browns, walnut, copper/gold, pine green, cream/snow
- Typography: **Manrope** (clean, modern sans-serif)

---

## 2. The New Website Being Built

### What it is
A **custom React web application** (not a template, not WordPress) that replaces the current basic website at simplynutsandmore.com. The new site has two key innovations:

1. **A visual logo design/customization tool** — lets corporate clients upload their logo, preview it on a container lid, adjust sizing/placement, and approve the design without back-and-forth emails
2. **An automated corporate ordering workflow** — a step-by-step flow that handles container selection, logo upload, recipient list management (CSV upload), nut selection, order review, and submission with minimal manual intervention

### Tech stack
- **Frontend:** React 18 + TypeScript + Vite 7 + Tailwind CSS v4
- **State management:** Zustand
- **Animations:** Framer Motion + GSAP (cinematic hero animations with laser particle effects)
- **Routing:** React Router v6
- **Architecture:** Monorepo with npm workspaces
  - `apps/prototype-web` — the current working prototype
  - `apps/storefront-hydrogen` — planned Shopify Hydrogen deployment (empty, future)
  - `packages/core` — business logic, event system, validation schemas
  - `packages/types` — TypeScript type definitions
  - `packages/ui` — shared UI components

### What's built and working
- **Landing page (HomePage):** Cinematic hero section with laser animation, sticky scroll marketing sections, email capture, trust badges, testimonial area
- **Products page:** Browse 3 container types with size selection and price display
- **Custom Order page (retail flow):** 4-step wizard — container → engraving → nut selection → review
- **Corporate Customizer page:** 5-step flow — container → design upload → recipient list (CSV) → review → submit. Enforces 12-unit minimum for corporate orders
- **Checkout page:** Mock payment form (not connected to real payment processing)
- **Navigation & cart:** Full cart drawer with line items, navbar with responsive design
- **Event system:** Dispatches lifecycle events (draft_created, email_captured, design_uploaded, order_submitted, etc.) to pluggable "sinks" — Console, Klaviyo, and CRM sinks are coded
- **Draft order state machine:** Orders flow through states: anonymous_draft → identified_draft → verified_draft → checkout_ready → submitted_order → in_review → in_production → shipped
- **Zod validation schemas:** For draft creation, email capture, email verification, recipient uploads

### What's mocked / not yet real
This is critical — **all business data in the code is hardcoded with placeholder values:**

| What's Hardcoded | Current Value | What's Needed |
|---|---|---|
| Container prices | $14.99–$59.99 | Real pricing from the business |
| Nut prices | $1.20–$2.50/oz | Real per-pound pricing |
| Logo surcharge | $5.00 flat | Confirm or adjust |
| Nut capacity per container | 12/24/36 oz | Verify with actual measurements |
| Product catalog | 3 mock items | Full catalog of all nuts, chocolates, mixes |
| Payment processing | Fake form | Shopify Payments or Stripe needed |
| Shipping rates | $0 (free) | FedEx/UPS real rates needed |
| Tax calculation | $0 | MN tax rules + interstate commerce |
| Klaviyo API key | Not set | Need account + API key |
| CRM webhook | Not set | Need to decide CRM system |
| Min corporate order | 12 units | Confirm |
| Lead time | 7–10 business days | Confirm by season |

### Planned next steps (development side)
- Migrate to **Shopify Hydrogen** for production deployment (Shopify Storefront API integration)
- Wire up **real payment processing** (Shopify Payments or Stripe)
- Connect **Klaviyo** for email automation (sinks are already coded)
- Implement **real shipping rate calculation** (FedEx/UPS API)
- Connect to a **CRM** for order management
- Add **admin dashboard** for order tracking, proof approval, production queue

---

## 3. Current Website (simplynutsandmore.com)

The existing website is basic — it serves as a brochure site with minimal e-commerce functionality. Key observations:

- Simple layout with product photos and descriptions
- No online ordering workflow — customers must call or email to order
- No logo upload or design preview tool
- Limited product information
- No corporate-specific landing pages or workflows
- Google Business Profile exists but may need updating
- The domain `simplynutsandmore.com` is active and will likely be kept

---

## 4. The Non-Development Task List

A comprehensive checklist has been created covering everything that needs to happen **outside of coding** before the website can launch. The full checklist is in `NON_DEV_TASKS.md` and covers these major areas:

### A. Physical Measurements & Specs
Every container needs exact dimensions (interior, exterior, engravable surface area, weight empty, weight packed) for shipping calculations and the design tool. The Epilog laser machine specs (bed size, run times per container type) need documenting.

### B. Product Catalog & Inventory
The complete list of every nut, chocolate, and mix variety with prices, allergen info, shelf life, and which products pair with which containers. Currently only 3 mock products exist in the code.

### C. Pricing & Business Rules
Real container pricing, bulk discount tiers (12–24, 25–49, 50–99, 100+), cost basis for margin calculation, early bird discount (5% before Nov 1), referral bonus (5% — need minimum order threshold), returning customer loyalty incentive, shipping rates, tax collection rules.

### D. Logo & Engraving Specs
Accepted file types, size limits, engravable area per container, character limits for text engraving, CorelDRAW pipeline requirements, design cleanup service pricing.

### E. Brand Assets
High-res logo (vector + raster), confirmed color palette and typography, Chippy mascot assets, product photography (every container and nut variety), process photos/videos (engraving, assembly, packing), lifestyle and holiday shots.

### F. Social Media & Online Presence
Priority platforms: LinkedIn (corporate buyers), Instagram (visual showcase), TikTok (laser ASMR content), Facebook (ads). Need identical handles across all platforms. Content strategy defined per platform.

### G. Social Proof & Trust
List of recognizable past corporate clients, get logo usage permission, collect testimonials, verify "37 years in business" and "500+ companies gifted" claims for the website.

### H. Marketing Copy & Email Automation
Welcome email, abandoned cart sequence (3 emails, witty tone), order confirmation, proof approval, fulfillment tracking, past customer re-engagement (pre-loaded designs), seasonal campaigns (early bird, Black Friday, last-minute December), SEO blog articles (7+ topics identified).

### I. Legal & Compliance
Terms of Service, Privacy Policy, return/refund policy, food handling/shipping compliance (MN regulations + interstate), labeling requirements, business license verification, ADA/accessibility basics.

### J. Accounts & Integrations
Shopify/Stripe, Klaviyo, FedEx/UPS business accounts, Google Analytics 4, social media accounts, domain/DNS configuration, business email setup.

### K. Operational Readiness
Past customer data export/cleanup, employee training on new workflow, production capacity planning (max orders/day with 2 Epilog machines), quality control process, holiday season launch timeline.

---

## 5. Key Strategic Questions & Priorities

These are open questions and strategic decisions that would benefit from a fresh perspective:

### Pricing strategy
- How to structure bulk pricing tiers to incentivize larger orders without leaving money on the table?
- Should container pricing include engraving or charge it separately?
- What's the right minimum order for the referral bonus?
- What loyalty incentive will bring back past customers?

### Marketing & launch timing
- When should the site go live relative to the holiday ordering season?
- What's the ideal cadence for email outreach to past customers?
- How to balance the "premium, family-run" brand with "efficient, tech-forward" new website messaging?
- Content creation priorities — what should be produced first with limited time/resources?

### Operational capacity
- With 2 Epilog machines doing 6 lids per run at 30+ minutes each, what's the realistic max daily output?
- How to manage the holiday rush bottleneck (most orders come in November–December)?
- Should there be a hard cutoff date for holiday orders? When?
- Backup plan if a laser machine goes down during peak season?

### Past customer re-engagement
- The plan includes pre-loading past designs into the new tool — how to message this to make it feel like a VIP upgrade rather than just a new website?
- How to collect/recover past logo files that may only exist in CorelDRAW format?

### Competitive differentiation
- What do competitors in the corporate gifting space offer that Simply Nuts doesn't?
- Are there adjacent markets (real estate agents, wedding favors, event sponsors) worth targeting?
- Should there be a year-round product offering, or is the seasonal focus actually a strength?

---

## 6. Brand Voice & Tone Guide

When writing copy, emails, or social media content for Simply Nuts & More, follow these guidelines:

### Voice characteristics
- **Warm & approachable** — family business, not corporate. Use "we" and "our," never "the company"
- **Witty & clever** — gentle humor, especially when positioning against boring corporate gifts
- **Confident but not arrogant** — 37 years of experience speaks for itself
- **Solution-oriented** — always frame around solving the customer's problem (impressing clients, saving time, avoiding generic gifts)

### Tone by context
| Context | Tone |
|---------|------|
| Website copy | Warm, confident, slightly playful |
| Corporate outreach | Professional but personable, solution-focused |
| Email marketing | Friendly, witty, concise — like a text from a trusted friend |
| Social media (LinkedIn) | Insightful, professional, subtly humorous |
| Social media (Instagram/TikTok) | Casual, satisfying, visually driven |
| Customer service | Attentive, accommodating, "white glove" |

### Key messaging pillars
1. **"Anti-boring corporate gift"** — position against generic gift baskets, fruitcakes, and impersonal Amazon gift cards
2. **"Made by hand, designed by you"** — emphasize the custom laser engraving + premium ingredients
3. **"37 years of making clients unforgettable"** — heritage and reliability
4. **"From our family to your business family"** — warm, personal touch at scale

### Words & phrases to use
- "Laser-engraved" (sounds premium and specific)
- "Premium roasted" / "Freshly roasted"
- "Custom" / "Personalized" / "Your logo, their smile"
- "White glove service"
- "Family-crafted" / "Small-batch"
- "Corporate gifting, simplified" (for the new workflow)

### Words & phrases to avoid
- "Cheap" / "Budget" / "Affordable" (position as premium)
- "Bulk order" (say "corporate order" or "volume order")
- "Factory" / "Mass-produced" (family workshop, not a factory)
- "Generic" / "One-size-fits-all" (that's what competitors do)

---

## 7. How to Use This File

### In Claude.ai Projects
Add this file as a **Project Knowledge** document. Then you can ask questions like:
- "Review the non-dev task list and suggest anything I'm missing"
- "Help me write the abandoned cart email sequence in the brand voice"
- "What's a fair bulk pricing structure for corporate orders?"
- "Create a LinkedIn content calendar for August–December"
- "Help me prioritize — I have 6 weeks before the holiday rush"
- "Draft the Terms of Service for the website"
- "What competitive advantages should I emphasize for corporate buyers?"

### In a regular Claude.ai conversation
Paste this entire file at the start of a new conversation, then ask your question. The context will persist throughout that conversation.

### Keeping it updated
As you gather real measurements, finalize pricing, or complete tasks from the checklist, update the relevant sections of this file so future conversations have accurate data to work with.
