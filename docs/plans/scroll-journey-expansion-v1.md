# Scroll Journey Expansion — Design Brief v1

**Date:** 2026-07-21
**Status:** Brainstorm / direction — not yet scheduled
**Builds on:** `FloatingIslandHero3D.tsx` (the island act, shipped Phase 4)

---

## Part 1 — The source-asset limitation, explained

### What actually happened with the almond

The tree sequences were generated as **image-to-video**: a Seedream still became the
first frame, then Kling animated it into 61 frames of "growth." The video model decided
what to animate. For the almond, it grew **one side of the crown** and left the other
side sparse — and because that decision is baked into every one of the 61 frames, no
amount of frame-picking or cross-fading can recover the missing canopy. The pixels
simply never existed.

That's the crux: **we outsourced composition to a generative video model, and it made a
composition choice we didn't want.** The current fix (`underfill` → mirror-fill the
canopy band in `drawFrame`) is a rendering workaround, not a cure.

### Why this matters far beyond one tree

The same failure mode scales badly:

| Approach | Weight (measured, this repo) | Control | Failure mode |
|---|---|---|---|
| Static layer WebP | `roots.webp` 118 KB + `surface.webp` 211 KB = **329 KB / 2 layers** | Total — you see exactly what ships | None; what you approve is what renders |
| Generated frame sequence | `almond/` **2.4 MB / 61 frames**; all 7 trees ≈ **24 MB** | Low — the model composes | Half-bloom, drift, flicker, baked-in mistakes |

A frame sequence costs roughly **70× more bytes** than a static layer *and* gives up
control. For a 5-act journey that math becomes fatal — 5 acts of sequence-driven art
would run 100 MB+.

### Recommendations (ranked)

**1. Adopt "still layers + code animation" as the default for all new scenes.**
Generate *stills* (which the image models are excellent at), cut them into depth layers
with alpha, and produce all motion in code — sway shaders, rotation, drift, particles,
parallax. This is what the island's roots/surface layers already do, and it's why they
cost 329 KB. Code motion is also art-directable after the fact (change a number, not a
render), respects `prefers-reduced-motion` for free, and can't half-bloom.

**2. Fix the almond properly by regenerating it — as stills, not video.**
Generate 3 hero stills (blossom → green → ripe almonds) of the *same* tree with a full,
balanced crown, then cross-fade between them across the maturation window. Three 828px
WebPs ≈ 150 KB replaces 2.4 MB, the composition is approved by eye before it ships, and
the ripening reads cleaner because each keyframe is deliberately art-directed. The
existing `underfill` flag then gets deleted.
*Generation notes:* frame the subject with ~15% margin on all sides, and generate the
**ripe** state first, then ask for the earlier states as variations of it, so the
silhouette stays consistent across the three.

**3. Keep mirror-fill only as the interim.** It's flagged in code and cheap to retire.

**4. If a future scene truly needs organic video motion** (e.g. flames, a flag, water),
keep it short, loop it, and treat it as one small element composited *into* a still
scene — never as the scene itself.

> **The rule to carry forward:** generative models compose *stills*; we compose *motion*.

---

## Part 2 — Expanding the journey (the depth-layer landing page)

### The unifying idea: one continuous camera flight

Rather than a set of unrelated scenes, the strongest framing is a **single continuous
journey with the island as the travelling vessel** — it lifts off the orchard, drifts
over the Minnesota field, arrives at the State Fair, and its harvest is carried into the
workshop where it becomes a corporate gift on someone's desk.

That gives every transition a reason to exist, and it dramatises the actual business:
*where the nuts come from → who we are → what we make → what your client receives.*

```
ACT I          ACT II         ACT III        ACT IV            ACT V
The Orchard →  The Field   →  State Fair  →  The Gift Line  →  The Shop
(shipped)      (heritage)     (proof)        (the offer)       (convert)
origin         Minnesota      37 years       corporate         featured
                              of trust       gifting           products
```

### The shared depth stack

Every act uses the same five-plane grammar, so the parallax feels like one world. Depths
extend the island's existing scale (`roots −0.6 → trees +0.2`):

| Plane | z | Scroll speed | Role |
|---|---|---|---|
| Sky / atmosphere | −3.0 | slowest | mood + colour story |
| Far background | −2.0 | slow | horizon, silhouettes |
| Mid background | −1.0 | medium | the scene's "set" |
| Hero subject | 0 | reference | what the act is *about* |
| Near foreground | +0.8 | fastest | grass, crowd, table edge — frames the shot |

Foreground plates are the secret weapon: something passing *close to camera* is what
sells real depth.

---

### ACT II — The Minnesota Field

**Beat:** where we're from. Calm breath after the orchard.

- **Sky** — wide prairie sky, slow drifting clouds
- **Far** — treeline, a distant silo/barn, water tower
- **Mid** — rolling field, wildflower drifts
- **Hero** — the island's shadow sliding across the grass as it passes overhead ✨
- **Near** — tall grass blades + coneflowers crossing the bottom of frame

**Motion (all code):** wind as *travelling gusts* — a sine wave that moves left→right
across the grass so blades bend in sequence rather than all together (this is the detail
that makes wind read as wind). Butterflies/seed fluff drifting. Chippy bounding through
the grass, briefly submerged, popping up — reusing the existing critter choreography.

**Palette:** golden hour — cream, gold, pine, warm shadow.

---

### ACT III — The Minnesota State Fair

**Beat:** proof + heritage. The loudest, most joyful frame on the site.

- **Sky** — dusk, warm gradient, occasional fireworks over the grandstand
- **Far** — **the ferris wheel, slowly rotating** (a single rotating PNG — enormous charm
  for almost no cost), grandstand silhouette with stage lights
- **Mid** — the food-booth row: mini donuts, cheese curds, corn, pronto pups — bulb
  lights strung between them, twinkling
- **Hero** — **the Simply Nuts & More booth**, warmly lit, kettle steaming, a queue of
  happy silhouettes
- **Near** — crowd silhouettes crossing the bottom of frame in soft focus

**Motion:** ferris wheel rotation, bulb-light twinkle (staggered opacity), steam rising
from the roasting kettle, drifting crowd silhouettes, occasional firework bloom.

**Interaction:** the booth is a hotspot → "Find us at the Fair" with dates. This is where
the "State Fair favourite for 37 years" trust claim earns its keep.

**Note:** the Fair is a 12-day event — consider a seasonal variant (or a "See you next
August" state) so it never feels stale.

---

### ACT IV — The Corporate Gift Line

**Beat:** the offer. This is the revenue act, so it should be the most *legible*.

Not a place but a **process** — so make it a literal production line that advances with
scroll. A conveyor runs horizontally; scrolling moves the gift along it, station by
station:

1. **Design** — laptop, logo dropped onto a lid preview
2. **Engrave** — the laser burning the lid *(reuse the existing `LaserHeroAnimation`
   language — sparks, smoke, progressive burn; it already exists and is on-brand)*
3. **Fill** — nuts cascading into the box
4. **Close** — lid + ribbon
5. **Label** — shipping label printing and applied
6. **Ship** — box onto the truck
7. **Arrive** — a client opening it at their desk, smiling — the emotional payoff

- **Far** — workshop wall, pegboard, window light
- **Mid** — the conveyor + machinery
- **Hero** — the gift itself, travelling
- **Near** — workbench edge, tools, wood shavings

**Motion:** conveyor advance tied to scroll (scrubbed, so it feels *driven* by the user),
laser sparks, nuts falling with real gravity, steam/dust motes in the window light.

**Payoff:** lands directly on **"Start your corporate order"** → `/corporate`.

---

### ACT V — The Shop (already built)

The featured-products reveal stays as the closer. The gift box from Act IV can hand off
into the product cards.

---

### Transitions

Best options, in order of impact:

1. **Camera travel** — the island lifts/exits frame and the camera descends into the next
   act. Most cinematic, most work.
2. **Foreground wipe** — a leaf, cloud, or passing crowd silhouette sweeps close to camera
   and reveals the next scene behind it. Cheap, very effective, hides the seam entirely.
3. **Colour-wash dissolve** — reuse the existing `.fih__mist` / `.fih__glow` overlays.
   Cheapest; already in the codebase.

Recommend **foreground wipe** as the default with colour-wash as the fallback on mobile.

---

## Part 3 — Technical architecture (so it doesn't melt the GPU)

The current act runs a strict budget (`docs/motion-system-v1.md`): DPR ≤ 2, no lights or
post-processing, ~25 draw calls, 7 live CanvasTextures. Five acts cannot all be resident.

**Act manager pattern:**
- One R3F canvas for the whole journey (never one canvas per act)
- Each act is a `<group>` mounted only when scroll is within its range **± one act**
- On exit, dispose that act's textures (the hero already disposes correctly — follow it)
- Lazy-load act assets as the previous act begins, so arrival is seamless
- Target: **≤ 6 layers × ~150 KB per act ≈ 1 MB/act**, ~5 MB for the whole journey —
  *less than a quarter of what the 7 tree sequences cost today*

**Scroll pacing:** the island act alone is a 600% pin. Five acts at that rate is ~3000%
of scrolling, which is genuinely too much. Options: tighten each act to ~250–350%, and/or
add a persistent **"Skip to shop"** affordance so buyers can bail out to commerce at any
moment. Never trap a customer inside the art.

**Mobile:** drop to 3 planes per act, halve texture resolution, single critter, colour-wash
transitions. Consider serving Acts I → IV-condensed → V.

**Accessibility:** `prefers-reduced-motion` renders one static, fully-composed keyframe per
act with normal document scrolling — the story still reads, nothing moves.

---

## Part 4 — Asset production plan

Per act: **5–6 layered PNG/WebP plates with alpha**, each generated as a still and cut
into depth layers. No video sequences.

Naming, consistent with the existing hero layers:

```
public/journey/<act>/sky.webp  far.webp  mid.webp  hero.webp  near.webp
brand-src/journey/<act>/       ← masters (NEVER under dist/)
```

**Generation guidance (learned from the almond):**
- Generate the **full composed scene** first, then cut layers from it — guarantees the
  layers actually fit together
- ~15% margin around subjects; parallax reveals scene edges as planes shift
- Approve the still **before** any derivative work
- Keep a consistent light direction and palette across all acts (golden-hour warm) so the
  journey reads as one world

---

## Open questions

1. **Scroll budget** — how long is too long? Would you rather have 5 tight acts or 3 rich ones?
2. **Fair seasonality** — always-on, or a seasonal variant outside August?
3. **Reference photography** — do you have real photos of the Fair booth, the workshop, and
   the Epilog engravers? Real reference makes the generated scenes look like *your* business
   rather than generic stock.
4. **Act IV realism** — should the gift line depict your actual workflow/equipment, or stay
   stylised?
5. **Deep links** — should acts be linkable (`/#fair`, `/#gifting`) for campaigns and email?
