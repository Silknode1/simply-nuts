# Chipmunk clips — motion vocabulary for the island hero

Four photoreal chipmunk clips, generated for the Floating Island hero (Phase 4).
They are a **motion vocabulary, not routes** — Fable drives the critters around the
island procedurally (randomized waypoints, timing, pauses, hide-behind-tree occlusion).
See `docs/plans/fable-phase4-store-chippy-brief-v1.md`.

## Files

| File | Motion | Loop? | Use |
|---|---|---|---|
| `run.mp4` | Treadmill run — legs cycling, body centered | Yes (trim/crossfade to a clean cycle) | The workhorse; translate position while playing |
| `leap.mp4` | One arcing hop — airborne → land → settle | No (one-shot) | Gap-crossings, sharp turns, playful pounce |
| `idle.mp4` | Nibble → glance around → nibble, in place | Yes (first ≈ last) | Pauses; dwell time when hidden behind a tree |
| `peek.mp4` | Rear up → alert head-up look → settle | No (one-shot) | Emerging from behind cover before darting out |

## Specs (all clips)
- 960 × 960, 24 fps, ~5.0 s (121 frames), H.264 MP4
- Subject: one consistent generic photoreal Eastern chipmunk, exact side profile facing **right**
  (mirror horizontally for the return direction)
- Background: flat chroma **green ≈ #009440** (samples range rgb(0,139,54)–rgb(1,148,62))

## Keying notes
- Key on green ≈ **#009440**; feather edges lightly and apply green **spill suppression**
  on the fur rim (chipmunk has warm tones that spill-key cleanly).
- A faint soft **ground shadow** appears under the feet on `leap.mp4` (landing) and slightly
  on `run.mp4`/`peek.mp4`. It keys out with the green; if any residue remains, clamp shadows
  or mask the lower ~8%.
- Two on-screen critters: reuse these four clips for both — hue-shift or slightly scale the
  second, and offset its path so critter B trails critter A (the chase).

## Source frames
First-frames used for i2v generation are in `frames/` (run/leap/idle/peek, 2048² PNG,
Seedream v5.0 Pro). Regenerate or re-key from these if needed.
