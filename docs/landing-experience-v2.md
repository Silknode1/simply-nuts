# Landing Experience v2 (Corporate-First, Retail-Strong)

## Context Carried Forward
This implementation follows the prior strategy:
- Shopify migration target with Hydrogen/Remix + TypeScript.
- Corporate custom orders as the highest-revenue and highest-scale channel.
- Retail ecommerce and events/state-fair presence treated as critical complementary channels.
- Warm premium brand voice with fun, intentional motion.

## Implemented in Prototype
- Cinematic hero with a tilted, zoomed product surface and simulated laser engraving animation.
- Interactive controls for container type, engraving text, and mascot inclusion.
- Three-path UX architecture:
  - Events and markets
  - Retail ecommerce
  - Corporate gifting studio
- Scroll-reveal storytelling sections inspired by modern editorial/product landing pages.
- Corporate feature panel focused on friction reduction and operational scale.

## Motion Direction (Now Active)
- Section reveals on scroll via IntersectionObserver.
- Engraving sweep animation for hero preview.
- Elevated hover interactions on cards.
- Reduced-motion accessibility fallback included.

## Framework/Architecture Fit
- Built in React + TypeScript prototype app (`apps/prototype-web`).
- Compatible with existing monorepo strategy (`packages/types`, `packages/core`, `packages/ui`).
- Designed for straightforward migration to Hydrogen routes/components later.

## Next Build Targets
- Add a true multi-step customizer route with autosave state machine integration.
- Implement upload + validation mocks for artwork and recipient files.
- Add 3D-enhanced container preview route (Three.js) only within customizer for performance discipline.
