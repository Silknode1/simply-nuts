# Simply Nuts — Floating Island Hero · Session Handoff (2026-07-07)

> ⚠ RESTORED COPY (2026-07-08): the original at `dist/brand/hero-build/` was
> deleted by a Vite build (see README-ASSET-INCIDENT.md). Text is verbatim;
> the `dist/brand/...` paths it references no longer exist.

## TL;DR
The floating-island maturing-nut hero is built end to end. All seven trees were turned into young→mature morph clips (Nano Banana still-frames → Kling first/last-frame video), split into WebP frame sequences, and wired into a scroll-scrubbed React hero (Canvas image-sequence + gsap ScrollTrigger — no three.js). Total generative spend ≈ **$2.95**. What remains is polish and integration, not generation.

## Current State
- **7/7 trees complete**: almond, cashew, pistachio, walnut, pine, pecan, peanut.
- Each tree has: a young start-frame + mature end-frame (3:4), a 5s Kling clip (828×1108, 24fps), and a 121-frame JPG sequence.
- Web-optimized 61-frame WebP sequences + a downscaled island are staged in `public/hero/` and consumed by the hero component.
- The prototype **typechecks clean** (`npm run typecheck`). The Vite build only fails *in the Linux sandbox* due to a macOS↔Linux rollup binary mismatch — it builds normally on your Mac.

## Where everything lives (paths relative to `apps/prototype-web/`)
- `dist/brand/Hero Floating Island.PNG` — original 4096×2304 source art.
- `dist/brand/hero-build/`
  - `frames/` — 14 normalized 3:4 start/end frames (896×1200).
  - `clips/1..7_*.mp4` — the seven Kling clips (keep as masters).
  - `frames_seq/<tree>/frame_001..121.jpg` — full-res frame sequences.
  - `_ALL_KLING_morphs.png`, `_ALL_SETS_contact_sheet.png` — review sheets.
- `public/hero/`
  - `hero-island.webp` — downscaled base island (1800px).
  - `seq/<tree>/f_01..61.webp` — web-optimized sequences the hero loads.
  - `preview.html` — **standalone preview; double-click to open in any browser.**
- `src/components/FloatingIslandHero.tsx` + `.css` — the React hero.
- Route added: `/island` (see `src/App.tsx`) → view at `http://localhost:5173/island`.

## Key Decisions Made
- **Kling v3.0 Std, first-frame + End-Image** ($0.071/s ≈ $0.357 per 5s clip) — cheapest v3.0 tier that supports start→end frame guidance; quality was excellent for the pilot so it was used for all.
- **Younger start-frames regenerated** for the already-ripe trees (cashew, walnut, pine, pecan, peanut) so each shows a full green→ripe arc; almond (blossom) and pistachio kept their source as the young state.
- **Canvas + gsap over three.js** for the scroll hero — seven flat planes scrubbing image sequences don't need a 3D engine, and the app already ships gsap. An R3F swap is straightforward later if true 3D depth is wanted.
- Atlas Cloud's playground UI crashes cosmetically on "Run" in an automated browser, but the backend still generates — results were always collected from **Request History**. (Manual clicking by a human is unaffected.)

## Cost ledger (Atlas Cloud balance)
- Start ≈ $22.18 → after all Nano Banana frames ≈ $21.73 (~$0.45) → after 7 Kling clips ≈ $19.23 (~$2.50). **Total ≈ $2.95.**

## How the hero works (and how to tune it)
`FloatingIslandHero.tsx` is fully data-driven by the `TREES` array:
- `left/top/w/h` — plane position as % of the 16:9 stage (from the source crop boxes). Nudge these to align a tree.
- `win: [start,end]` — the scroll-progress window (0..1) over which that tree matures. Reorder/overlap to change the ripening wave.
- `shop/label/href` — hotspot text + link (currently → `SHOP_COLLECTIONS.nuts`; pine is decor, no hotspot).
- Edge feathering is a CSS `mask-image` radial-gradient on `.fih__tree` — widen/tighten if a plane seam shows.

## Open Questions / Next Steps
1. **Eyeball `preview.html`** and fine-tune each plane's `left/top/w/h` + the mask feather so every tree seats cleanly on the island. (I couldn't do a live visual pass — the automation browser kept dropping — so expect small position nudges.)
2. Point hotspot `href`s at real Shopify product/collection URLs once handles exist.
3. Decide final copy for the `.fih__titles` headline/subhead.
4. Optional: add a "harvest pile" shimmer beat in the center, and a mobile layout pass (the stage is responsive but dense on narrow screens).
5. Optional: if you want true 3D parallax/tilt, port the same manifest into an R3F `<Canvas>` (adds three / @react-three/fiber / drei).

## Resume Context (paste into a new chat)
> Continuing the Simply Nuts floating-island hero in `apps/prototype-web`. All 7 tree morph clips + WebP frame sequences exist under `public/hero/seq/` and `dist/brand/hero-build/`. The scroll hero is `src/components/FloatingIslandHero.tsx` (Canvas image-sequence + gsap ScrollTrigger), viewable at `/island` and via `public/hero/preview.html`. Next: fine-tune per-tree plane positions in the `TREES` manifest so they seat on the island, wire real Shopify hotspot links, and finalize copy.
