# Archive — `simply-nuts-main` (legacy standalone prototype)

**This branch is a freezer, not a project.** Nothing here is built, deployed,
typechecked or maintained. It exists so components can be retrieved later without
keeping a second website alive.

- **Archived:** 2026-07-30
- **Came from:** `~/Documents/simply-nuts-main` (standalone React + Vite app, never
  a git repo, living in iCloud-synced Documents)
- **Superseded by:** `apps/prototype-web` on `master` — that is the single site
- **Excluded from the copy:** `node_modules`, `dist`, `.DS_Store` (265MB → 352KB)

This branch is an **orphan** — it shares no history with `master` and will never
merge into it. That is deliberate: it keeps the archive one command away without
putting a retired codebase in the main history.

---

## Retrieving something

You do not need to check this branch out. From any branch:

```bash
git show archive/simply-nuts-main:src/components/LaserEngraveHero.tsx
```

To pull a file into your working tree:

```bash
git checkout archive/simply-nuts-main -- src/components/LaserEngraveHero.tsx
```

That lands it at the same relative path, staged. Move it where it belongs and
remember it was written against the old app's conventions.

To browse the whole thing without disturbing your current work:

```bash
git worktree add /tmp/snm-archive archive/simply-nuts-main
```

---

## What is actually worth taking

### `src/components/LaserEngraveHero.tsx` (373 lines) — the reason this branch exists

A Framer Motion path-drawing animation: a laser beam "engraves" the wordmark, with
decorative nut outlines and particle sparks. The **concept is strong and on-brand** —
it is literally the service being sold.

Two caveats before reusing it:

1. **The SVG paths are hand-authored approximations of the logo, not the real brand
   wordmark.** Look at `LOGO_PATHS` / `ENGRAVE_PATHS` — they are rough letterform
   guesses. Production use wants paths traced from the actual logo artwork.
2. `apps/prototype-web` already has `LaserHeroAnimation.tsx` + `LaserParticles.tsx`
   covering similar ground (also currently unreferenced). Compare the two before
   porting rather than adding a third.

Intended home: a **section** on the quote + customizer page, not a hero. It competes
with the 3D island for the opening slot, and the island won on differentiation.

### `src/pages/CustomOrderPage.tsx` (557) + `src/store/designStore.ts` (134)

**Mine for requirements, do not port.** This is the customizer being rebuilt from
scratch. Read it for the field list, option taxonomy and step flow, then write fresh
code against the current design language.

### Everything else — leave it here

| File | Why not |
|---|---|
| `CartDrawer.tsx`, `CheckoutPage.tsx` | Shopify owns cart and checkout. Porting these re-creates the two-codebase split. |
| `Navbar.tsx`, `Footer.tsx`, `AboutPage.tsx`, `ContactPage.tsx`, `HomePage.tsx`, `ProductsPage.tsx` | Superseded by the journey design language. The pre-3D retail UI is explicitly deprecated (see root `CLAUDE.md`). |

---

## Note on the original location

The source directory was in `~/Documents`, which is iCloud-synced. iCloud broke this
project twice — corrupted `.git` lock files, then evicted `node_modules` to the cloud
and hung the dev server. Now that this branch exists, the `~/Documents` copy is
redundant and safe to delete.
