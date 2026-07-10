# WORK ORDER — Simply Nuts "Floating Island" Hero → React-Three-Fiber 3D parallax

> ⚠ RESTORED COPY (2026-07-08): the original at `dist/brand/hero-build/` was
> deleted by a Vite build (see README-ASSET-INCIDENT.md). Text is verbatim;
> note that `dist/brand/...` asset paths named below no longer exist — see the
> README for what survived and where.

You are building the production 3D version of an existing, working hero. A 2D
Canvas + gsap version already ships (`src/components/FloatingIslandHero.tsx`,
route `/island`). Your job is to upgrade it to **React-Three-Fiber** so the
island has genuine depth: camera/mouse parallax, layered z-depth (roots behind,
surface in front, trees as billboards), and the same scroll-driven maturation.
Reuse the existing frame sequences and manifest — do NOT regenerate any imagery.

## Stack / repo facts (do not re-derive)
- App: `apps/prototype-web` — React 18 + TypeScript + **Vite**. Ships as a static
  build (`dist/`) served from Simply Nuts' own domain (host-agnostic — no
  Netlify/Vercel coupling; just a static bundle + the `public/hero/` assets).
- Already installed: `gsap` (with ScrollTrigger, hoisted at monorepo root), `framer-motion`, `react-router-dom`, `zustand`, `lucide-react`.
- You must add: `three`, `@react-three/fiber`, `@react-three/drei`. Run installs from repo root (`npm i -w @snm/prototype-web three @react-three/fiber @react-three/drei`).
- Shop links: import `SHOP_COLLECTIONS` from `src/config.ts` (hotspots currently point to `SHOP_COLLECTIONS.nuts`).
- Build/verify: `npm run typecheck` (must stay clean) and `npm run build:prototype`.

## Assets (already generated — reuse as-is)
Base path: `apps/prototype-web/`
- `dist/brand/Hero Floating Island.PNG` — original **4096×2304** island art (source of truth for depth-layer masking).
- `public/hero/hero-island.webp` — 1800px downscaled island (2D base; you'll replace with depth layers, see Task 1).
- `dist/brand/hero-build/frames_seq/<tree>/frame_001..121.jpg` — **full-res 828×1108** per-tree sequences (24fps). USE THESE, not the 600px web copies.
- `public/hero/seq/<tree>/f_01..61.webp` — 600px web copies (too soft for 4K; regenerate at 828px, Task 2).
- `dist/brand/hero-build/clips/1..7_<tree>.mp4` — the source Kling clips (masters).

Seven trees, left→right: **almond, cashew, pistachio, walnut, pine, pecan, peanut**
(pine is decorative — no hotspot). Each frame sequence morphs the tree young→mature.

## TREE MANIFEST (positions are % of a 16:9 stage; carry these over verbatim)
```
id         left   top    w      h      win(scrollProgress)  shop  label
almond     2.3%   0.9%   21.2%  50.3%  [0.00, 0.34]         yes   Shop Almonds
peanut     4.8%   39.9%  11.4%  26.9%  [0.05, 0.40]         yes   Shop Peanuts
cashew     29.8%  0.7%   21.0%  49.9%  [0.12, 0.50]         yes   Shop Cashews
pistachio  42.8%  8.7%   18.3%  43.4%  [0.22, 0.60]         yes   Shop Pistachios
walnut     54.2%  1.1%   21.0%  49.9%  [0.34, 0.72]         yes   Shop Walnuts
pine       63.3%  3.9%   16.5%  39.1%  [0.46, 0.82]         no    —
pecan      71.5%  3.5%   20.5%  48.6%  [0.58, 0.95]         yes   Shop Pecans
```
Source crop boxes (px, in the 4096×2304 original) if you need exact footprints:
almond (95,20,965,1180) · cashew (1219,15,2081,1165) · pistachio (1755,200,2505,1200) ·
walnut (2219,25,3081,1175) · pine (2593,90,3268,990) · pecan (2930,80,3770,1200) ·
peanut (198,920,663,1540).

## FIDELITY note (important)
Per-tree master frames are **828×1108**. Largest tree plane ≈ 21% of stage width,
so it displays at ~290px (1440p) up to ~770px (4K) — always ≤ native, i.e. crisp.
Therefore: **feed the 828px `frames_seq` masters** (or 828px WebP, Task 2) to the
tree textures. Do not upscale. 4K-tier re-render is only needed for full-bleed
giant-tree treatments (out of scope).

## TASKS

### Task 1 — Split the island into depth layers (the reason to use R3F)
The current island is one flat image, which is why 3D wasn't worth it before.
Create 3 layers from `Hero Floating Island.PNG` so parallax has something to move:
1. **Roots layer** (the dangling underside/roots) — mask + soft alpha, sits at z ≈ -0.6.
2. **Surface layer** (mossy top, scattered nuts, harvest pile) — z ≈ 0.0.
3. Trees are separate billboard planes (Task 3) at slightly varying z (≈ +0.05..+0.2).
Export each layer as a transparent PNG/WebP to `public/hero/layers/`. A quick path:
segment by the horizontal moss line (roots below, surface above), feather the seam.

### Task 2 — Regenerate web tree sequences at native res
Re-encode each `frames_seq/<tree>` (or the source mp4) to **828px** WebP, ~48–60
frames, into `public/hero/seq828/<tree>/`. Example:
`ffmpeg -i clips/2_cashew.mp4 -vf "fps=12,scale=828:-1" -c:v libwebp -q:v 74 public/hero/seq828/cashew/f_%02d.webp`

### Task 3 — R3F scene
- `<Canvas>` (orthographic or a low-FOV perspective camera). Preload all tree
  frame sequences into textures; per frame, set each tree plane's `map` to the
  frame chosen by scroll (see Task 4). Use `THREE.CanvasTexture`/`useTexture` and
  swap the image per frame (or a texture atlas if you prefer).
- Island group = Roots plane (z-0.6) + Surface plane (z 0) + `MaturingTree × 7`
  billboards positioned from the manifest (map % → world units against a 16:9
  plane). Trees at staggered z for parallax.
- **Float**: `useFrame` → gentle `sin()` bob on the island group.
- **Parallax**: offset camera (or group) by normalized pointer position, damped;
  add a small scroll-linked group rotation/tilt. Respect `prefers-reduced-motion`.
- **Hotspots**: drei `<Html>` anchored to each shoppable tree; reveal (fade+scale)
  when that tree's local maturation ≥ ~0.88; link to `SHOP_COLLECTIONS.nuts`
  (swap to real product URLs when handles exist). Pine gets none.

### Task 4 — Scroll → maturation (frame-accurate, no video seeking)
- Native scroll + Lenis (optional smoothing) OR gsap ScrollTrigger pinning the
  canvas for ~360% height → `progress` 0..1.
- Per tree: `local = clamp((progress - win.start)/(win.end - win.start), 0, 1)`,
  `frameIndex = round(local * (N-1))`. This gives the rolling left→right ripening
  wave. Draw/swap that frame's texture. Fire `onMatured()` when local ≥ 1.
- Frame 001 of every sequence ≈ the young source state, so at scroll=0 the hero
  reads like the original island; at scroll=1 every tree is ripe.

### Task 5 — Integration & perf
- Replace/augment `/island` route with the R3F component (keep the Canvas version
  as `FloatingIslandHeroCanvas.tsx` fallback). Consider it for the home hero.
- Preload with a loader; lazy-decode sequences; cap DPR (`dpr={[1,2]}`); dispose
  textures on unmount. Target 60fps on a mid laptop, no jank on scroll.
- Keep `npm run typecheck` clean and `npm run build:prototype` passing.

## Acceptance criteria
- Scroll ripens all 7 trees in the staggered order above, seated correctly on the
  island (start from the manifest %; nudge as needed).
- Island floats; mouse/scroll produces real depth parallax between roots, surface,
  and trees. Reduced-motion users get a static, still-correct scene.
- Shoppable hotspots appear on ripening and link out; pine has none.
- Trees are crisp on 4K (828px textures). Clean typecheck + build.

## Brand context (just enough for on-brand copy + feel — don't scope-creep beyond the hero)
- **Who:** Simply Nuts & More — family-run since 1987. Positioning: "the family-run
  gifting partner that makes custom appreciation gifts effortless." This page is the
  retail marketing front door; commerce lives on Shopify (hotspots link out).
- **Voice:** warm, premium-without-pretension, heritage-with-heart. Hero copy should
  feel handcrafted and earnest, not techy. (Current placeholder: "Grown by hand. /
  Scroll to watch the harvest ripen." — keep or refine in this voice.)
- **Palette (Tailwind v4 @theme tokens in `src/styles.css`):** wood browns
  (`--color-wood-*`, e.g. 600 `#8b5529`), forest greens (`--color-forest-*`, 500
  `#3d8b3d`), gold accents (`--color-gold-500 #d4a017`), cream (`--color-wood-50
  #fdf8f0`). Hotspots/CTAs already use wood/gold. Match these; don't introduce new hues.
- **⚠ Motion guardrail (from `docs/motion-system-v1.md`):** the brand motion system
  says *"3D/WebGL focused on the customizer only… avoid heavy runtime 3D on
  non-customizer pages,"* keep transitions on opacity/transform, and always ship a
  reduced-motion fallback. This hero is a non-customizer page, so: budget the 3D
  tightly (cap DPR, dispose textures, no heavy post/lights), keep it 60fps on a
  mid laptop, and make the reduced-motion path a genuinely still, correct scene —
  or the shipped Canvas version stays the fallback. If the 3D can't stay light,
  the 2D Canvas hero is the on-brand default.

## Commerce boundary (Shopify)
This hero is marketing only. The ecommerce storefront is on **Shopify** (separate
domain). Do NOT build cart, checkout, product data, or Shopify APIs into the hero —
hotspots are simple outbound deep-links via `SHOP_COLLECTIONS`. Keep the component
purely presentational.

## References / inspiration (LOCKED — three, each covering one axis; emulate ONLY the noted part)
1. **Scroll mechanic — Apple product page** (e.g. AirPods Pro, https://www.apple.com/airpods-pro/).
   The gold standard for a **scroll-pinned image-sequence scrub**. Borrow: the pacing
   and pinned feel of scroll driving a frame sequence — NOT the minimal aesthetic.
2. **Island feel — Jordan Breton "Floating Island" portfolio** (FWA Site of the Day,
   Oct 2025; search "Jordan Breton floating island portfolio" to open it). A floating
   sky-island of grass, water, trees, butterflies — the closest analog to our concept.
   Borrow: the **float + layered z-depth + subtle ambient life**. NOT its density —
   ours stays calmer, cleaner, and shoppable.
3. **Brand feel — "Coffee & Chocolate"** (Awwwards, artisan Italian pastry;
   awwwards.com → search "Coffee & Chocolate"). Borrow: **warm editorial typography +
   generous spacing + heritage warmth** — so the hero reads family-craft, not tech demo.

Optional 4th only if you want a cursor-reveal interaction: **Hubtown / Unseen Studio**
(Awwwards SOTD Jun 2026) — borrow just the *restrained mouse-parallax reveal*, kept light.

Rule for all references: take the ONE noted trait, nothing else; treat any
heavy continuous WebGL as mood, never a spec (see motion guardrail above).
Keep references aspirational but bounded by the motion guardrail above (light 3D,
reduced-motion fallback). If a reference implies heavy continuous WebGL, treat it as
mood only, not a spec.

## Reference (this project's own artifacts)
- Working 2D version: `src/components/FloatingIslandHero.tsx` (+ `.css`) — copy its
  manifest, windowing math, and hotspot logic; only the render layer changes.
- Standalone preview of the intended motion: `public/hero/preview.html`.
- Full project handoff & cost ledger: `dist/brand/hero-build/HERO-HANDOFF.md`.
