# Motion Reference Synthesis — what to steal, and why

**Date:** 2026-07-21
**Source:** `Website Animations.zip` — 7 screen recordings of animated landing pages (236 MB,
frame-sampled into contact sheets for analysis)
**Purpose:** turn the references into concrete, buildable rules for the unified scroll journey.

---

## The references, decoded

| # | What it is | The transferable pattern |
|---|---|---|
| **v1** | "VisualStudio" — AI image tool. Near-black stage, a mossy crystal rock centre-frame that **blooms with pink flowers then recedes to buds**, huge serif wordmark the rock **overlaps**, green ambient glow bleeding into the dark. | **Dark stage + luminous subject = expensive.** Subject *interpenetrates* the type. Object-driven ambient glow. |
| **v3** | Dark starfield newsletter site. Whole page scrolls over a **persistent nebula background**; **glowing vines hang from the top of the viewport over the content**; dark translucent panels float; small dioramas recur down the page. | **One continuous world, not stacked slides.** A **near-foreground plane** is what makes you feel *inside* the scene. Recurring dioramas as section anchors. |
| **v2** | "Sync" — light hero, rolling green flowering hills, big clean headline, **client logo row across the base of the hero**. | Light rooms can feel just as premium. Logos belong **integrated into a scene**, not quarantined in a grey strip. |
| **5** | Agency site — bright sky, flowering hill mirrored in still water, serif-italic headline. | The **light counterpoint**. Proves tonal variety across a page is a feature. Slow drift ≫ fast motion. |
| **6 / 7** | Luminous spheres with liquid gradients morphing inside, bloom spilling onto black. | **Section dividers / loading states.** A single glowing object can carry a whole beat. |
| **motionsistes 6** | A comet — bright point trailing ribbons of light — sweeping across dark purple. | **Transition wipe** and the natural language for our **laser**. A travelling light that reveals. |

---

## The four rules that came out of it

**1. Tone is the section divider.** None of these sites use rules or borders between sections —
they change the *lighting*. Our rooms therefore each own a background, and no two adjacent rooms
share a tone:

```
orchard      harvest      health        corporate     clients     studio       schedule
neutral/dim  light cream  deep forest   dark walnut   bridge      near-black   dusk blue
   ░░░          ▓▓▓          ███           ██▓          ░▒░          ███          ▒▒█
```

**2. Depth needs something close to the camera.** v3's hanging vines are the single most
"immersive" device in the set — cheap to build, disproportionate payoff. Every richly-staged room
should have a near-plane element that crosses in front of content.

**3. Motion is slow and continuous, never snappy.** Across all 7, nothing pops or bounces
aggressively; things *drift, bloom, breathe, sweep*. Entrances 400–800 ms on
`cubic-bezier(0.2, 0.8, 0.2, 1)`. Upscale reads as *unhurried*.

**4. The subject earns the stage.** v1 gives one object the entire frame and lets it transform.
Our island already does this — the lesson is to **stop decorating and let it perform**.

---

## Applied: the island's scroll choreography

The user asked for "move, shrink, grow, shake, zoom off page." Mapped to the narrative:

| Scroll beat | Island behaviour | Borrowed from |
|---|---|---|
| Open | centred, full size, trees **ripening** | v1's bloom cycle |
| Mid | camera dollies in, mist → golden hour | existing |
| Hero close | **parks left + shrinks**, product cards bloom right | v1 (object yields to type/UI) |
| → Harvest | island **exits upward and off-frame**, light floods in | tonal cut, v2/5 |
| Rooms | island absent; each room owns the frame | v3 (content panels over world) |
| → Schedule | a small island **drifts back in** at the fair, distant | v3's recurring dioramas |

**Transitions between rooms** use the comet: a warm light-streak sweeps across the seam
(`motionsistes 6`), doubling as the laser motif — the same visual grammar that engraves the boxes.

---

## Non-negotiables carried from `docs/motion-system-v1.md`

- Transform + opacity only. Never animate layout properties.
- The hero act is the page's only WebGL. Everything below is IntersectionObserver + CSS.
- `prefers-reduced-motion` gets a genuine static composition, not a broken one.
- Blur panels only — never a full-screen backdrop-filter over the canvas.

---

## What we deliberately did NOT copy

- **The purple/violet palette** of refs 6, 7 and motionsistes 6 — beautiful, but it's a tech-SaaS
  signal. We keep wood/gold/cream and use those refs only for *motion* grammar.
- **Ultra-dark everything** (v1, v3). A food brand needs appetite, and appetite needs warmth and
  light. We alternate: dark rooms frame the product, light rooms sell it.
- **Device-frame chrome** (the browser mock in v1/v2/v3 recordings) — that's an artefact of how the
  references were captured, not a design choice.
