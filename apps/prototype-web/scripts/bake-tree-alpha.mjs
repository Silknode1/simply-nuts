#!/usr/bin/env node
/**
 * bake-tree-alpha — turn the baked-backdrop tree renders into true RGBA frames.
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * The tree sequences were rendered onto an opaque studio backdrop with no alpha
 * channel (`alpha=Undefined`). While the 3D stage shared that same grey it was
 * invisible, but the island now travels across cream, forest, walnut and dusk
 * rooms, where the backdrop reads as a grey plate behind every tree.
 *
 * That was previously fought at runtime with a chroma-key shader. A shader can
 * only ever guess, and it lost on the trees whose backdrop is warm rather than
 * neutral (pecan's corner is rgb(246,235,218) — no saturation key catches it).
 * Keying ONCE, offline, with real connectivity information is both more correct
 * and free at runtime.
 *
 * HOW THE KEY WORKS
 * The backdrop is a smooth, low-saturation studio sweep; the subject is either
 * saturated (foliage, blossom, fruit) or dark (bark, soil, roots). So:
 *
 *   1. Seed a region grow from the whole border, gated so only sweep-coloured
 *      pixels become seeds. The island's soil and roots touch the bottom edge
 *      but are chromatic, so they never seed and never get eaten.
 *   2. Grow with a LOCAL step tolerance rather than a global one. A studio
 *      sweep changes by well under a unit per pixel, so a tight step never
 *      blocks legitimate gradient; but an anti-aliased silhouette edge ramps
 *      ~16/px, which halts the grow. This is what makes it robust to per-tree
 *      backdrop colour AND to gradients, without any hand-tuned constants.
 *   3. Gate on saturation. Foliage and bark are chromatic; the sweep is not.
 *      Interior blossom is protected by connectivity — reaching it from the
 *      border means crossing branches, which the saturation gate blocks.
 *   4. Recover soft alpha in the boundary band and UNPREMULTIPLY it, so edge
 *      pixels lose their backdrop contamination. Skipping this is what leaves
 *      the classic grey fringe that reads as "cheap cutout".
 *
 * Usage:  node scripts/bake-tree-alpha.mjs [treeId ...]
 *         (no args = all trees)
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Masters live in brand-src, NOT public — public/ is copied wholesale into the
// build output, and shipping 24MB of opaque frames that nothing renders is pure
// dead weight on every visitor.
const SRC = path.join(HERE, '..', 'brand-src', 'hero-seq-raw', 'seq828');
const OUT = path.join(HERE, '..', 'public', 'hero', 'trees');

const TREES = ['almond', 'cashew', 'peanut', 'pecan', 'pine', 'pistachio', 'walnut'];
const FRAMES = 61;

/** Saturation ceiling for "this could be backdrop". Foliage/bark sit far above. */
const SAT_MAX = 26;
/** Relaxed ceiling, only granted to very bright pixels (warm studio sweeps). */
const SAT_MAX_BRIGHT = 44;
const BRIGHT_LUM = 196;
/** Per-pixel step the grow may take. Smooth sweeps step <1; AA edges step ~16. */
const STEP_TOL = 7;
/** Colour distance over which a boundary pixel ramps from transparent to solid. */
const EDGE_SOFTNESS = 46;

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b);

/**
 * Could this pixel be studio sweep rather than subject?
 *
 * A flat saturation gate is not enough: some sequences were lit warm, and
 * pecan's sweep reaches rgb(246,235,218) — saturation 28, just over a neutral
 * threshold, which left an opaque patch in the corner. So allow more chroma
 * when the pixel is also very bright, which a warm sweep is and foliage never
 * is (leaf green sits near luminance 60-90 with saturation 45+).
 *
 * Pale blossom is bright and low-saturation and would pass this gate, but it is
 * protected by connectivity and by the per-pixel step rule: reaching interior
 * blossom means crossing chromatic branches, and a silhouette blossom edge
 * ramps ~12/px against the sweep, well over STEP_TOL.
 */
const couldBeSweep = (r, g, b) => {
  const s = sat(r, g, b);
  return s <= SAT_MAX || (s <= SAT_MAX_BRIGHT && lum(r, g, b) >= BRIGHT_LUM);
};

/**
 * Delivery width. The trees paint at roughly 200-300 CSS px, so 560 is still
 * comfortably retina, and it keeps the alpha-enabled set at about the same
 * total weight as the opaque originals it replaces.
 *
 * The downscale happens HERE, on the opaque source, deliberately: resizing
 * after keying would blend the transparent pixels' RGB (which is zeroed) into
 * the silhouette and re-introduce the dark fringe the unpremultiply just
 * removed. Keying the already-small image cannot have that problem.
 */
const OUT_WIDTH = 560;

function readRGB(file) {
  const res = spawnSync('magick', [file, '-resize', `${OUT_WIDTH}x`, '-depth', '8', 'RGB:-'], {
    maxBuffer: 1 << 30,
    encoding: 'buffer'
  });
  if (res.status !== 0) throw new Error(`decode failed: ${file}\n${res.stderr}`);
  return res.stdout;
}

const WEBP = ['-quality', '76', '-define', 'webp:alpha-quality=90'];

function writeRGBA(buf, w, h, file) {
  const res = spawnSync(
    'magick',
    ['-size', `${w}x${h}`, '-depth', '8', 'RGBA:-', ...WEBP, file],
    {input: buf, maxBuffer: 1 << 30}
  );
  if (res.status !== 0) throw new Error(`encode failed: ${file}\n${res.stderr}`);
}

function dims(file) {
  const res = spawnSync('magick', ['identify', '-format', '%w %h', file], {encoding: 'utf8'});
  const [w, h] = res.stdout.trim().split(/\s+/).map(Number);
  const scale = OUT_WIDTH / w;
  return {w: OUT_WIDTH, h: Math.round(h * scale), scale};
}

/**
 * Flood the backdrop from the top border and return {alpha, bg} where `bg`
 * holds, for every background pixel, the colour that was there — used later to
 * decontaminate the soft edge.
 */
function keyFrame(rgb, w, h) {
  const n = w * h;
  const isBg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let qh = 0;
  let qt = 0;

  const at = (i) => {
    const o = i * 3;
    return [rgb[o], rgb[o + 1], rgb[o + 2]];
  };

  // Seed from the whole border, gated on saturation. Seeding only the top is
  // not enough: foliage routinely spans the full width, sealing the grow into
  // the upper band and leaving the backdrop below it untouched. The saturation
  // gate is what keeps the island's own soil, moss and roots from seeding —
  // they are chromatic, the studio sweep is not.
  const seed = (i) => {
    const [r, g, b] = at(i);
    if (couldBeSweep(r, g, b) && !isBg[i]) {
      isBg[i] = 1;
      queue[qt++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }

  while (qh < qt) {
    const i = queue[qh++];
    const [pr, pg, pb] = at(i);
    const pl = lum(pr, pg, pb);
    const x = i % w;
    const y = (i / w) | 0;

    for (let d = 0; d < 4; d++) {
      const nx = x + (d === 0 ? -1 : d === 1 ? 1 : 0);
      const ny = y + (d === 2 ? -1 : d === 3 ? 1 : 0);
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx;
      if (isBg[j]) continue;
      const [r, g, b] = at(j);
      if (!couldBeSweep(r, g, b)) continue;
      if (Math.abs(lum(r, g, b) - pl) > STEP_TOL) continue;
      isBg[j] = 1;
      queue[qt++] = j;
    }
  }

  // --- enclosed pockets ------------------------------------------------------
  // Gaps between leaves show the same sweep but are unreachable from the border,
  // so the flood above leaves them opaque — grey confetti inside the canopy.
  // They are, by definition, the backdrop colour, so measure what the backdrop
  // actually was on THIS frame and re-seed anything matching it closely.
  const samples = [];
  for (let i = 0; i < n; i += 97) {
    if (isBg[i]) samples.push(lum(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]));
  }
  if (samples.length > 32) {
    samples.sort((a, b) => a - b);
    const median = samples[samples.length >> 1];
    const HOLE_TOL = 13;
    qh = qt = 0;
    for (let i = 0; i < n; i++) {
      if (isBg[i]) continue;
      const o = i * 3;
      const r = rgb[o];
      const g = rgb[o + 1];
      const b = rgb[o + 2];
      if (!couldBeSweep(r, g, b)) continue;
      if (Math.abs(lum(r, g, b) - median) > HOLE_TOL) continue;
      isBg[i] = 1;
      queue[qt++] = i;
    }
    // Let each pocket spread to its own soft rim under the same step rule.
    while (qh < qt) {
      const i = queue[qh++];
      const [pr, pg, pb] = at(i);
      const pl = lum(pr, pg, pb);
      const x = i % w;
      const y = (i / w) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = x + (d === 0 ? -1 : d === 1 ? 1 : 0);
        const ny = y + (d === 2 ? -1 : d === 3 ? 1 : 0);
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (isBg[j]) continue;
        const [r, g, b] = at(j);
        if (!couldBeSweep(r, g, b)) continue;
        if (Math.abs(lum(r, g, b) - pl) > STEP_TOL) continue;
        isBg[j] = 1;
        queue[qt++] = j;
      }
    }
  }
  return isBg;
}

/**
 * Turn the binary mask into soft, decontaminated RGBA. Boundary pixels get
 * partial alpha based on how far they've travelled from the local backdrop
 * colour, then are unpremultiplied so no backdrop tint survives in the edge.
 */
function composeRGBA(rgb, isBg, w, h) {
  const n = w * h;
  const out = Buffer.alloc(n * 4);

  for (let i = 0; i < n; i++) {
    const o3 = i * 3;
    const o4 = i * 4;
    const r = rgb[o3];
    const g = rgb[o3 + 1];
    const b = rgb[o3 + 2];

    if (isBg[i]) {
      out[o4] = out[o4 + 1] = out[o4 + 2] = out[o4 + 3] = 0;
      continue;
    }

    // Is this a boundary pixel? Find the nearest background colour if so.
    let bgR = 0;
    let bgG = 0;
    let bgB = 0;
    let bgN = 0;
    const x = i % w;
    const y = (i / w) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (!isBg[j]) continue;
        const p = j * 3;
        bgR += rgb[p];
        bgG += rgb[p + 1];
        bgB += rgb[p + 2];
        bgN++;
      }
    }

    if (bgN === 0) {
      out[o4] = r;
      out[o4 + 1] = g;
      out[o4 + 2] = b;
      out[o4 + 3] = 255;
      continue;
    }

    bgR /= bgN;
    bgG /= bgN;
    bgB /= bgN;
    const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
    const a = Math.max(0, Math.min(1, dist / EDGE_SOFTNESS));

    if (a < 0.004) {
      out[o4] = out[o4 + 1] = out[o4 + 2] = out[o4 + 3] = 0;
      continue;
    }

    // Unpremultiply: recover the subject's own colour free of backdrop tint.
    out[o4] = Math.max(0, Math.min(255, Math.round((r - bgR * (1 - a)) / a)));
    out[o4 + 1] = Math.max(0, Math.min(255, Math.round((g - bgG * (1 - a)) / a)));
    out[o4 + 2] = Math.max(0, Math.min(255, Math.round((b - bgB * (1 - a)) / a)));
    out[o4 + 3] = Math.round(a * 255);
  }
  return out;
}

/**
 * RECONSTRUCTION — for sequences whose subject was rendered off-frame.
 *
 * The almond was framed with its trunk at x≈791 of 828, so the right half of
 * the crown was never rendered. That is the real cause of the long-standing
 * "almond is only half blooming" complaint: it is not a sparse canopy, it is
 * literally half a tree. No runtime trick can invent the missing pixels, and
 * the previous `underfill` density hack only muddied the frames it had.
 *
 * So rebuild it here, once: slide the tree inboard to make room, then graft on
 * a mirrored copy of its own canopy. The copy is scaled and rotated rather than
 * flopped straight, because an exact reflection reads instantly as a butterfly
 * — and it drags the moss mound into an obvious duplicate too.
 *
 * This is a reconstruction, not a restoration. Regenerated almond art with a
 * full crown in frame would let this whole block be deleted.
 */
/* Geometry is expressed against the 828px master and scaled to OUT_WIDTH. */
const RECONSTRUCT = {
  almond: {shift: 300, pivotX: 331, pivotY: 864, scale: 0.86, angle: -4, toX: 545, toY: 884}
};

function reconstruct(file, cfg, w, h, k) {
  const tmp = `${file}.shift.png`;
  const mir = `${file}.mir.png`;
  const run = (args) => {
    const r = spawnSync('magick', args, {encoding: 'buffer'});
    if (r.status !== 0) throw new Error(`reconstruct failed on ${file}\n${r.stderr}`);
  };
  const R = (v) => Math.round(v * k);
  const viewport = ['-background', 'none', '-virtual-pixel', 'none', '-define', `distort:viewport=${w}x${h}`];
  const srt = `${R(cfg.pivotX)},${R(cfg.pivotY)} ${cfg.scale} ${cfg.angle} ${R(cfg.toX)},${R(cfg.toY)}`;
  run([file, ...viewport, '-distort', 'SRT', `${R(cfg.shift)},0 1 0 0,0`, tmp]);
  run([tmp, '-flop', ...viewport, '-distort', 'SRT', srt, mir]);
  run([tmp, mir, '-compose', 'DstOver', '-composite', ...WEBP, file]);
  spawnSync('rm', ['-f', tmp, mir]);
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : TREES;
let done = 0;
const total = targets.length * FRAMES;

for (const id of targets) {
  const dir = path.join(OUT, id);
  if (!existsSync(dir)) mkdirSync(dir, {recursive: true});

  for (let f = 1; f <= FRAMES; f++) {
    const name = `f_${String(f).padStart(2, '0')}.webp`;
    const src = path.join(SRC, id, name);
    const {w, h, scale} = dims(src);
    const rgb = readRGB(src);
    const isBg = keyFrame(rgb, w, h);
    const dest = path.join(dir, name);
    writeRGBA(composeRGBA(rgb, isBg, w, h), w, h, dest);
    if (RECONSTRUCT[id]) reconstruct(dest, RECONSTRUCT[id], w, h, scale);
    done++;
    if (f === 1 || f % 20 === 0 || f === FRAMES) {
      process.stdout.write(`  ${id} ${f}/${FRAMES}  (${done}/${total} total)\n`);
    }
  }
}
console.log(`\nBaked ${done} frames -> ${path.relative(process.cwd(), OUT)}`);
