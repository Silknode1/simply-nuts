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

---

## Part 5 — Answers + real reference assets (2026-07-21)

Owner supplied `SimplyNutsIMG.zip` (25 files). Masters now live in
`apps/prototype-web/brand-src/reference/` (three oversized print files were downscaled to
2400px — the 48×28.8" poster alone was 56 MB).

### What we now have — and what it unlocks

| Asset | Unlocks |
|---|---|
| `MN State Fair Background.PNG` / `Banner` / `Outline No Text` | **Act III backdrop, already drawn.** Flat blue vector skyline: ferris wheel, grandstand, Space Tower, sky-ride gondolas, giant slide, roller coaster, the arch sign, livestock, crowd, fireworks |
| `State fair booth.JPG` (+ 2, 3, 4) | **Act III hero — the real booth.** Signature wooden barrels w/ brown lids, logo cart fronts, "FREE SAMPLES" Chippy signs, red *Cinnamon Almonds* banners, Blue Ribbon 72 |
| `Woodenbox 16/32/64/96oz`, `Bamboo Containers` | **Act IV product + corporate gallery.** Real engraved lids, sliding-lid birch boxes, cellophane nut bags w/ oval label |
| `Epilog Fusion Maker 70w`, `Used-Epilog-Inside`, `epilog-fusion-maker-12` | **Act IV station 2** — the actual engraver, not a generic machine |
| `Fun Corporate Serious Style Guide (8).png` | Brand lockup: chunky brown wordmark w/ gold outline, "& More" in gold script, 3D Chippy, blue engraver |
| `Simply Nuts Free Samples`, `Blue Ribbon Coupon book`, `Main Banner`, `Poster` | Signage/props for Act III set dressing |

### 🎨 Art-direction unlock: keep the Fair blue

The supplied Fair skyline is **monochrome blue** while the journey palette is warm
wood/gold/cream. The instinct is to recolour it — **don't.** Blue reads as *dusk*, and if
the backdrop stays cool while the **Simply Nuts booth glows warm gold** in the foreground,
you get complementary contrast that makes the booth the unmistakable hero of the frame.
Cool distance, warm welcome. It also keeps the Fair visually distinct from the orchard and
workshop acts, so the journey has tonal variety instead of five golden-hour scenes in a row.

Layer split for Act III, straight from the supplied vector:

| Plane | Content |
|---|---|
| Sky (−3) | dusk gradient + fireworks (already separate elements in the art) |
| Far (−2) | Space Tower, grandstand, **ferris wheel — rotate this in code** |
| Mid (−1) | arch sign "MINNESOTA STATE FAIR", sky-ride gondolas (drift along the cable) |
| Hero (0) | **the real booth**, warm-lit — barrels, banners, FREE SAMPLES signs, steam off the kettle |
| Near (+0.8) | crowd + livestock silhouettes crossing frame, soft-focus |

### ⚠️ Client logos — real ones found, permission needed

`Woodenbox 32oz.JPEG` shows finished gifts engraved for **K2 Capital Group**,
**Orijin Stone**, and **Motorwerks BMW**. That's enough to replace the placeholder
wordmarks in `LogoMarquee.tsx` — **but get written permission first.** Showing past-work
*photography* is normal; presenting client marks as an endorsement logo-wall is a different
claim, and BMW in particular polices its roundel aggressively. Recommended: ask the three
for logo-usage sign-off; until then run the marquee on photos of the engraved lids rather
than extracted logos (arguably more persuasive anyway — it shows craft, not just names).

### ⚠️ Two Chippys — pick one

The style guide uses a **3D Pixar-style Chippy**; the booth's FREE SAMPLES signs use a
**flat illustrated Chippy**. Both are in active use. The journey should commit to one
(recommend the 3D render for the site, since it matches the existing `chippy-laser.webp`
finale) and treat the flat one as heritage signage inside the Fair act — where it's
period-correct set dressing rather than an inconsistency.

### Decisions locked

- **Scroll length** — optimise for what looks best; **no "Skip to shop" button** (owner
  dislikes them). Instead: keep acts tight (~250–350% each), make the glass nav's
  **Shop Now** permanently available — it already is — and let that be the escape hatch.
  A persistent act-progress indicator is a nicer alternative if wayfinding is needed.
- **Fair act** — **always-on**, with holiday additions layered in seasonally (garland on the
  booth, snow, a holiday-lit variant of the arch sign).
- **Act IV** — use the **real** Epilog machines and real boxes; we have the reference.

### Research: corporate gifting positioning (Jul 2026)

Market context worth putting in the copy deck:
- Corporate gifting is a **~$957B market in 2026**, projected ~$1.31T by 2030
- **55%** of organisations report higher client retention from strategic gifting; **43%**
  cite retention as their primary reason to gift
- **89%** report higher ROI from *personalised/customised* gifts vs generic — this is
  precisely Simply Nuts' wedge (laser-engraved = personalised by definition)
- Personalisation is the **#1 named 2026 trend**

**Positioning implication:** lead the corporate page with *retention*, not *holiday*. The
buyer's job-to-be-done is "keep my clients," and the data says personalised gifts win that.
Headline direction: "The gift they keep on their desk" / "Client retention, hand-roasted."

**Hashtag / keyword sets** (Instagram + LinkedIn):

- *Core:* `#corporategifts` `#corporategifting` `#customgifts` `#personalizedgifts`
  `#businessgifts` `#clientgifts` `#corporategiftideas`
- *Craft:* `#laserengraved` `#laserengraving` `#custommade` `#engravedgifts` `#woodengraving`
- *Product:* `#nuts` `#gourmetgifts` `#giftbox` `#holidaygifts`
- *Local/heritage:* `#mnstatefair` `#minnesotamade` `#chanhassen` `#shoplocalmn`
- *Long-tail (low volume, high intent — best for LinkedIn + SEO pages):*
  `#uniquecustomerretentiongift` `#corporategiftsforclients` `#clientappreciation`
  `#employeeappreciationgifts`

Note the split: broad tags (`#gifts`, `#gift`) are far too saturated to convert — the
**long-tail + local** sets are where a 37-year Minnesota maker actually wins.

### Deep links (revised recommendation)

Worth doing, and cheap: give each act an anchor (`/#orchard`, `/#fair`, `/#gifting`) so
email/social campaigns can drop people at the right beat — e.g. a `#mnstatefair` post links
straight to the Fair act, a LinkedIn retention post lands on the gift line. Requires the act
manager to support "jump to act" (scroll to that act's pin offset) rather than forcing a
scroll from the top.

---

---

## Part 6 — The site scrape (2026-07-21): a better narrative spine

Scraped `simplynutsandmore.com` → full findings in **`docs/BRAND_FACTS_FROM_SITE.md`**.
Three things change the plan.

### 🐿️ 1. The chipmunk is the origin story — not decoration

**The Secret Peanuts:** Grandpa Carney was perfecting a peanut brittle recipe one winter
evening. He stepped out for firewood; a **chipmunk** got in, spilled the Virginia
red-skinned peanuts **into the mixing bowl**, and fled with full cheeks. What came out was
accidental **butter toffee peanuts** — the signature product to this day. He left a batch
outside his door for the chipmunk every year after.

So: **the chipmunk invented the best-seller.** Chippy, the critters already running around
the island, the word "Secret," and the top product all trace to one story.

**Recommendation — promote the chipmunk to narrator.** Instead of ambient wildlife, the
critter *leads* the journey: it darts ahead at each act transition, and the journey opens on
a short **Act 0 — the cottage** (snowy window, warm lamp, the spill) before lifting to the
orchard. That turns a pretty parallax demo into a story with a protagonist, and it makes the
existing `ChipmunkChase` choreography load-bearing rather than ornamental.

### 📅 2. "Where's the Nut Guy?" is a real, dated schedule

The legacy site has a `/where-is-the-nut-guy/` page. Captured as data in
**`apps/prototype-web/src/data/events.ts`** — 25 published **Canterbury Park** (Shakopee)
appearances across Jun–Sep 2026, with `upcomingEvents()` and `formatEventDate()` helpers.

This is the perfect closing beat, and it's *better* than a generic "shop" ending because it's
proof of life: a real business, at a real place, this weekend.

**Design — "Where's the Nut Guy?" panel** (glass card, same language as `FeaturedHarvest`):

```
WHERE'S THE NUT GUY?
Jul 22–23   Canterbury Park · Shakopee, MN
Jul 25–26   Canterbury Park · Shakopee, MN
Jul 30      Canterbury Park · Shakopee, MN
                                   [ See full schedule ]
```

Place it **beside the featured products in the final act** — commerce on one side, "come see
us in person" on the other. It also gives the Fair act a natural hotspot target.

⚠️ The **2026 State Fair dates are NOT published** on their page — left commented out in
`events.ts` rather than guessed. Owner needs to confirm before it ships.

### 📊 3. Numbers and voice worth putting on the page

- **225+ shows a year** · **~96% repeat customers** · founded **1986** at an art fair that had
  no good food — the origin of the whole show-circuit model
- **"Made fresh to order — never pre-roasted."** A real operational differentiator
- Roasting philosophy, owner verbatim: *"temperature is probably the most important factor"*
- Public testimonials name **Honeywood Builders**, **VAA LLC**, **St. Anthony Kiwanis Club** —
  safer social proof than the engraved client logos, since the business already publishes them

### ⚠️ 4. Factual error in our live copy

Their About page says **founded 1986 by Chris Carney**. Our site says **"1987 / 37 years"** in
**13 places**. In 2026 the correct figure is **40 years**. Needs owner confirmation (1986
started vs 1987 incorporated?), then a one-pass fix. "40 years" is the stronger number.

### Also missing from the new site

`/gift-certificates/` exists on the legacy site and has no equivalent on ours — possible
revenue gap worth a look.

---

## Remaining open questions

1. **Client logo permission** — do you want to approach K2 Capital, Orijin Stone and
   Motorwerks BMW, or run the marquee on engraved-lid photography instead?
2. **Chippy consistency** — commit to the 3D Chippy sitewide?
3. **Booth setting** — the real booth sits under a concrete pavilion (numbered bays). Depict
   it accurately, or take licence and place it in the open-air midway for a prettier frame?
4. **Act count** — with real assets in hand, the Fair and Gift Line are clearly the two
   strongest. Worth considering **4 acts** (fold the Field into the orchard→fair transition)
   so nothing feels like filler.
