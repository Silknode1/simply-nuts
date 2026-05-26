# Corporate Prototype — Reference Only

These React/Vite files were the original corporate-gifting prototype (customizer,
container products, mock cart/checkout, draft store). They were moved here out of the
retail/landing app (`apps/prototype-web`) as part of the retail/corporate codebase split.

**They are NOT built or typechecked** — this folder sits outside Hydrogen's `app/**`
tsconfig include on purpose. Treat it as frozen reference while building the real
corporate customizer in the Hydrogen app (`app/`).

Contents:
- `pages/CustomizerPage.tsx`, `pages/CustomOrderPage.tsx` — 5-step corporate customizer flow
- `pages/ProductsPage.tsx` — gift-container catalog (wooden box / bamboo / tin)
- `pages/CheckoutPage.tsx`, `components/CartDrawer.tsx` — mock cart/checkout (Shopify replaces these)
- `store/designStore.ts`, `store/cartStore.ts` — Zustand state for the customizer + cart
- `hooks/useDraftStore.ts`, `api/mockHandlers.ts` — mock draft-order API layer
- `components/StepProgress.tsx`, `components/ProductCard.tsx`, `components/CorporateFeatures.tsx` — supporting UI
- `hooks/useReveal.ts` — copied so CustomizerPage resolves; the live copy lives in the landing app

When porting to Hydrogen, the shared business logic (state machine, schemas, events,
adapters) already lives in `packages/core`; reuse it rather than the mock pieces here.
