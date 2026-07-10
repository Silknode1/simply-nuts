# ⚠ Hero asset incident + what lives here (2026-07-08)

`npm run build:prototype` (Vite, default `emptyOutDir`) **deleted
`dist/brand/hero-build/`**, where the hero generation masters were stored.
Storing source assets inside the build output directory was a landmine; this
directory (`brand-src/`, outside `dist/`) is the new safe home.

## Permanently lost (no Time Machine snapshot, no Trash, dist/ gitignored)
- `clips/1..7_<tree>.mp4` — the seven 5s Kling clip masters (828×1108, 24fps)
- `frames_seq/<tree>/frame_001..121.jpg` — full 121-frame JPG sequences
- `Hero Floating Island.PNG` — original 4K art *with its gray backdrop*
- `FABLE-KICKOFF.md`, review/contact sheets, `crops/`, `ends/`, `frames/`, `masks/`

## Survived / recovered into this directory
- `Hero-Floating-Island-4k-cutout.png` — the full 4096×2304 island art,
  background removed + alpha cleaned (this is now the master for the island).
- `Hero-Floating-Island-4k-cutout-raw.png` — same, before alpha speck cleanup.
- `FABLE-R3F-WORKORDER.md`, `HERO-HANDOFF.md` — restored verbatim from the
  session that had read them before the wipe.

## Shipping assets (unaffected, live under `public/hero/`)
- `seq828/<tree>/f_01..61.webp` — 828×1108 61-frame sequences, generated from
  the JPG masters *before* the deletion (odd frames 1,3,…,121 of the 24fps
  sequence — i.e. effectively 12fps, matching the workorder's Task 2 target).
  **These are now the highest-resolution tree sequences in existence.**
- `seq/<tree>/f_01..61.webp` — 600px versions (previous web set).
- `layers/roots.webp` + `layers/surface.webp` — 2048px depth layers cut from
  the 4K art (Task 1 output).
- `hero-island.webp` — 1800px flat island (2D fallback base).

## Impact on the hero build
None for shipping: the 828px sequences are native-res for every on-screen size
the manifest produces (largest tree ≈ 770px at 4K). What is no longer possible
is *regenerating* frames at a different fps/resolution or re-cropping from the
originals — any future re-render would need new generative runs (see the cost
ledger in HERO-HANDOFF.md ≈ $2.95 total).

## Rule going forward
**Never store source/master assets under `dist/`.** Keep them here in
`brand-src/` (git-tracked if size allows) or another non-build path.
