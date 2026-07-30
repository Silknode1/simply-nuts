import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SHOP_COLLECTIONS } from '../config';
import ChipmunkChase from './ChipmunkChase';
import './FloatingIslandHero.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * FloatingIslandHero3D
 * ------------------------------------------------------------------
 * React-Three-Fiber upgrade of the 2D scroll-scrubbed island hero.
 * Same manifest, windowing math and hotspot logic as the Canvas
 * version (FloatingIslandHeroCanvas.tsx) — only the render layer
 * changed. Depth comes from three planes:
 *   roots (z -0.6)  <  surface (z 0)  <  tree billboards (z 0.05..0.2)
 * A low-FOV perspective camera orbits with the pointer and dollies in
 * with scroll, so the z-separation produces real parallax.
 *
 * Motion design (scroll = the story):
 *  - island bobs, sways, and slowly SINKS + tilts + grows while the
 *    camera pushes in — the harvest gaining weight
 *  - trees sway from their base and pulse once when they ripen
 *  - shadows SHIFT: tree base shadows deepen + migrate with scroll,
 *    a cloud shadow drifts across the moss, the contact shadow breathes
 *  - color journey: neutral → cool mist (mid-scroll mystery) → golden
 *    hour (CSS overlays, opacity only); titles fade as the story takes over
 *  - ambient life: gold pollen, drifting leaves circulating in front of
 *    and behind the island, and gold sparkles that build with ripeness
 *
 * Budget guardrails (docs/motion-system-v1.md — non-customizer page):
 * DPR capped at 2, no lights/post (basic materials only), 7 live
 * CanvasTextures (frames stay as decoded <img>s on the CPU), ~25 draw
 * calls, textures disposed on unmount, genuine prefers-reduced-motion
 * path (static ripe scene, demand-rendered, no scroll pin, no particles,
 * only the final frame of each sequence downloaded).
 */

const NUTS = SHOP_COLLECTIONS.nuts;

type Tree = {
  id: string;
  frames: number;
  left: number; top: number; w: number; h: number; // % of the 16:9 stage
  win: [number, number];                            // maturation window in scroll progress 0..1
  z: number;                                        // billboard depth (world units)
  noShadow?: boolean;                               // edge trees: base shadow would hang off the island
  shop?: boolean; label?: string; href?: string;
};

const TREES: Tree[] = [
  { id: 'almond',    frames: 61, left: 2.3,  top: 0.9,  w: 21.2, h: 50.3, win: [0.00, 0.34], z: 0.12, shop: true, label: 'Shop Almonds', href: NUTS },
  { id: 'peanut',    frames: 61, left: 4.8,  top: 39.9, w: 11.4, h: 26.9, win: [0.05, 0.40], z: 0.20, noShadow: true, shop: true, label: 'Shop Peanuts', href: NUTS },
  { id: 'cashew',    frames: 61, left: 29.8, top: 0.7,  w: 21.0, h: 49.9, win: [0.12, 0.50], z: 0.10, shop: true,  label: 'Shop Cashews',    href: NUTS },
  { id: 'pistachio', frames: 61, left: 42.8, top: 8.7,  w: 18.3, h: 43.4, win: [0.22, 0.60], z: 0.16, shop: true,  label: 'Shop Pistachios', href: NUTS },
  { id: 'walnut',    frames: 61, left: 54.2, top: 1.1,  w: 21.0, h: 49.9, win: [0.34, 0.72], z: 0.08, shop: false },
  { id: 'pine',      frames: 61, left: 63.3, top: 3.9,  w: 16.5, h: 39.1, win: [0.46, 0.82], z: 0.05, shop: false },
  { id: 'pecan',     frames: 61, left: 71.5, top: 3.5,  w: 20.5, h: 48.6, win: [0.58, 0.95], z: 0.14, shop: true,  label: 'Shop Pecans',     href: NUTS },
];

const STAGE_W = 16;
const STAGE_H = 9;
const CAM_FOV = 20;
const CAM_DIST = STAGE_H / 2 / Math.tan(((CAM_FOV / 2) * Math.PI) / 180); // vertical-fit distance ≈ 25.5
const ROOTS_Z = -0.6;
const SURFACE_Z = 0;
// Frame the island lower + smaller than full-bleed so tree tops clear the
// navbar/titles on wide desktop viewports and the island reads centered.
const BASE_S = 0.85; // ~25% larger than the original 0.68 framing
const BASE_Y = -1.27;

// critical assets gating the loader: 2 island layers + 1 first frame per tree
const CRITICAL_COUNT = 2 + TREES.length;

/**
 * TRAVEL CHOREOGRAPHY — the island's flight path across the rest of the page.
 * ---------------------------------------------------------------------------
 * Once the hero's ripening beat ends, the island stops being a hero and becomes
 * a COMPANION: it shrinks, sweeps side to side, dips off-frame and pokes back in
 * at the edges while the content rooms scroll past. Poses are keyed on travel
 * progress `t` (0 = the moment the hero ends, 1 = the foot of the page) and
 * lerped between, so the flight reads as one continuous arc rather than steps.
 *
 * x/y are world units (the visible stage is roughly x -8..8, y -4.5..4.5), so a
 * pose at |x| ≈ 7-8 is deliberately half off-screen — that's the "poking out"
 * read. `op` keeps it faint over text-heavy rooms so it never fights the copy.
 */
export type IslandLane = 'left' | 'right' | 'top';

type Pose = { x: number; y: number; s: number; op: number; rot: number };

/**
 * Where the island sits while a given room is on screen. Each room reserves a
 * matching empty corridor in its layout (see `.lane--*` in journey.css), so the
 * island travels through a real gap in the page rather than floating on top of
 * the copy. It stays close to fully opaque throughout — you should always be
 * able to see the orchard working.
 */
const LANE_POSE: Record<IslandLane, Pose> = {
  right: { x: 6.2, y: 0.4, s: 0.72, op: 0.98, rot: -0.06 },
  left: { x: -6.2, y: 0.4, s: 0.72, op: 0.98, rot: 0.06 },
  top: { x: 0.2, y: 3.2, s: 0.55, op: 0.92, rot: 0.0 },
};

/** Pose the moment the hero beat ends — parked left, still large. */
const EXIT_POSE: Pose = { x: -2.7, y: -1.3, s: 1.05, op: 1, rot: 0 };
/** Pose past the last room — rises and clears the top of the page. */
const LIFTOFF_POSE: Pose = { x: 0.2, y: 5.9, s: 0.88, op: 0, rot: 0 };

const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
  s: lerp(a.s, b.s, k),
  op: lerp(a.op, b.op, k),
  rot: lerp(a.rot, b.rot, k),
});

type LaneAnchor = { center: number; side: IslandLane };

/**
 * Sample the flight path from the REAL positions of the lane anchors in the
 * document, rather than from guessed scroll percentages. The island is always
 * heading to (or sitting in) the corridor of whichever room is nearest the
 * middle of the viewport, so the choreography stays correct no matter how the
 * rooms' heights change.
 */
function poseFromLanes(anchors: LaneAnchor[], focus: number): Pose {
  if (anchors.length === 0) return EXIT_POSE;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  // approaching the first room: glide out of the hero pose
  if (focus <= first.center) {
    const span = Math.max(first.center - (first.center - window.innerHeight), 1);
    const k = smooth(clamp((focus - (first.center - window.innerHeight)) / span, 0, 1));
    return mixPose(EXIT_POSE, LANE_POSE[first.side], k);
  }
  // past the last room: lift away
  if (focus >= last.center) {
    const span = Math.max(window.innerHeight * 1.2, 1);
    const k = smooth(clamp((focus - last.center) / span, 0, 1));
    return mixPose(LANE_POSE[last.side], LIFTOFF_POSE, k);
  }
  // between two rooms: cross from one corridor to the next
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (focus >= a.center && focus <= b.center) {
      const span = Math.max(b.center - a.center, 1);
      const k = smooth(clamp((focus - a.center) / span, 0, 1));
      return mixPose(LANE_POSE[a.side], LANE_POSE[b.side], k);
    }
  }
  return LANE_POSE[last.side];
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const BASE = (import.meta as any).env?.BASE_URL ?? '/';
const asset = (p: string) => `${BASE}hero/${p}`.replace(/\/{2,}/g, '/');
// `trees/` holds the alpha-baked delivery frames (scripts/bake-tree-alpha.mjs).
// The opaque masters they were keyed from live outside the app bundle.
const frameUrl = (id: string, i: number) => asset(`trees/${id}/f_${String(i + 1).padStart(2, '0')}.webp`);
const FRAME_W = 560;
const FRAME_H = 749;

/** Compensation so a plane at depth z shows the exact manifest footprint on screen. */
const depthScale = (z: number) => (CAM_DIST - z) / CAM_DIST;

/*
 * The tree sequences used to be keyed at runtime by a chroma-key shader, with
 * per-tree backdrop sampling to cope with sequences that were rendered in
 * separate batches (their backdrops ran 168-221, and pecan's was warm rather
 * than neutral, which no saturation key could take cleanly).
 *
 * That is all gone. The frames under public/hero/trees carry real alpha, baked
 * once by scripts/bake-tree-alpha.mjs, so a plain textured plane is correct and
 * cheaper. Re-run that script if the source sequences are ever re-exported.
 */

/** Soft black ellipse with baked alpha — shared by tree base shadows, cloud + contact shadows. */
function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.save();
  ctx.translate(128, 64);
  ctx.scale(1, 0.5);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.4)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-128, -128, 256, 256);
  ctx.restore();
  return new THREE.CanvasTexture(c);
}

/** Tiny soft dot for the pollen motes. */
function makeMoteTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

/** Four-ray star flare for the sparkles. */
function makeSparkTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d')!;
  const core = ctx.createRadialGradient(32, 32, 0, 32, 32, 10);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 64, 64);
  ctx.globalCompositeOperation = 'lighter';
  for (const rot of [0, Math.PI / 2]) {
    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate(rot);
    const ray = ctx.createLinearGradient(-30, 0, 30, 0);
    ray.addColorStop(0, 'rgba(255,255,255,0)');
    ray.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    ray.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = ray;
    ctx.fillRect(-30, -1.5, 60, 3);
    ctx.restore();
  }
  return new THREE.CanvasTexture(c);
}

/** Simple tapered leaf/blade silhouette — tinted per instance. */
function makeLeafTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.translate(32, 32);
  ctx.rotate(0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 24, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(0, 24);
  ctx.strokeStyle = 'rgba(190,190,190,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  return new THREE.CanvasTexture(c);
}

/** Full-stage island layer (roots or surface) at a fixed depth. */
function LayerPlane({ url, z, onReady }: { url: string; z: number; onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    const t = new THREE.Texture();
    img.onload = () => {
      if (!alive) return;
      t.image = img;
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      setTex(t);
      onReady();
      invalidate();
    };
    img.src = url;
    return () => { alive = false; t.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!tex) return null;
  const s = depthScale(z);
  return (
    <mesh position={[0, 0, z]} scale={s}>
      <planeGeometry args={[STAGE_W, STAGE_H]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/**
 * One tree billboard, pivoted at its base: a plane whose CanvasTexture is
 * redrawn with the scroll-selected frame. Sways gently, pulses once on
 * ripening, and casts a soft base shadow that deepens + migrates with scroll.
 */
function MaturingTree({
  t, index, progressRef, shadowTex, reduced, onReady,
}: {
  t: Tree;
  index: number;
  progressRef: React.MutableRefObject<number>;
  shadowTex: THREE.CanvasTexture;
  reduced: boolean;
  onReady: () => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const groupEl = useRef<THREE.Group>(null);
  const shadowEl = useRef<THREE.Mesh>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const rt = useRef<{ imgs: (HTMLImageElement | undefined)[]; cur: number; pulseStart: number }>(
    { imgs: new Array(t.frames), cur: -1, pulseStart: -1 },
  );

  const { ctx, tex } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_W; canvas.height = FRAME_H;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    // straight (un-premultiplied) alpha, matching how the frames were baked
    tex.premultiplyAlpha = false;
    return { ctx, tex };
  }, []);

  const drawFrame = useCallback((f: number) => {
    const img = rt.current.imgs[f];
    if (!img) return;
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);
    ctx.drawImage(img, 0, 0);
    tex.needsUpdate = true;
    rt.current.cur = f;
    invalidate();
  }, [ctx, tex, invalidate]);

  useEffect(() => {
    let alive = true;
    const load = (i: number, cb?: () => void) => {
      const img = new Image();
      img.onload = () => { if (!alive) return; rt.current.imgs[i] = img; cb?.(); };
      img.src = frameUrl(t.id, i);
    };
    // reduced motion: only the ripe frame is ever needed (saves the whole sequence)
    const critical = reduced ? t.frames - 1 : 0;
    load(critical, () => {
      drawFrame(critical);
      onReady();
    });
    if (!reduced) for (let i = 1; i < t.frames; i++) load(i);
    return () => { alive = false; tex.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = depthScale(t.z);
  const w = (t.w / 100) * STAGE_W;
  const h = (t.h / 100) * STAGE_H;
  const x = ((t.left + t.w / 2) / 100) * STAGE_W - STAGE_W / 2;
  const yBottom = STAGE_H / 2 - ((t.top + t.h) / 100) * STAGE_H;

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const [a, b] = t.win;
    const local = clamp((p - a) / (b - a), 0, 1);
    const f = clamp(Math.round(local * (t.frames - 1)), 0, t.frames - 1);
    if (f !== rt.current.cur && rt.current.imgs[f]) drawFrame(f);
    // maturation deepens the tree's ground shadow; scroll shifts it — the sun moving
    if (shadowMat.current) shadowMat.current.opacity = 0.1 + 0.3 * local;
    if (shadowEl.current) shadowEl.current.position.x = w * lerp(-0.06, 0.12, smooth(p));
    if (reduced || !groupEl.current) return;
    const ms = clock.elapsedTime * 1000;
    const chaos = 1 + 1.1 * smooth(p);
    // breeze sway from the base (two harmonics, phase-offset per tree),
    // wilder as the harvest ripens
    groupEl.current.rotation.z =
      (Math.sin(ms / 1900 + index * 1.7) * 0.012 + Math.sin(ms / 640 + index * 2.3) * 0.004) * chaos;
    // one satisfying pulse the moment the tree finishes ripening
    if (local >= 1 && rt.current.pulseStart < 0) rt.current.pulseStart = ms;
    let pulse = 1;
    if (rt.current.pulseStart >= 0) {
      const k = clamp((ms - rt.current.pulseStart) / 420, 0, 1);
      pulse = 1 + 0.05 * Math.sin(k * Math.PI);
    }
    // canopy "breathe": a slight vertical stretch that reads as leaves rustling
    const rustle = 1 + Math.sin(ms / 480 + index * 3.1) * 0.004 * chaos;
    groupEl.current.scale.set(s * pulse, s * pulse * rustle, s * pulse);
  });

  return (
    <group ref={groupEl} position={[x * s, yBottom * s, t.z]} scale={s}>
      {/* soft ground shadow, kept just in front of the surface plane */}
      {!t.noShadow && (
      <mesh ref={shadowEl} position={[0, 0.03, 0.02 - t.z]}>
        <planeGeometry args={[w * 0.72, w * 0.2]} />
        <meshBasicMaterial ref={shadowMat} map={shadowTex} transparent opacity={0.1} depthWrite={false} toneMapped={false} />
      </mesh>
      )}
      <mesh position={[0, h / 2, 0]}>
        <planeGeometry args={[w, h]} />
        {/* The frames carry real alpha now, so this is just a textured plane.
            No key, no per-tree tuning, no shader — see scripts/bake-tree-alpha.mjs */}
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* The per-tree "Shop <nut>" pills were replaced by ONE island sign
          (see <IslandSign/>) — six competing labels cluttered the orchard. */}
    </group>
  );
}

/**
 * IslandSign — the orchard's ONE shop sign.
 * Anchored to the island so it travels with it. Fades in once the harvest has
 * meaningfully ripened, and stays a single clear destination instead of six
 * competing "Shop <nut>" pills.
 */
function IslandSign({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const el = useRef<HTMLAnchorElement>(null);

  useFrame(() => {
    if (!el.current) return;
    el.current.classList.toggle('on', progressRef.current >= 0.3);
  });

  return (
    <Html position={[0, 3.15, 0.36]} center wrapperClass="fih__hotspot-wrap">
      <a
        ref={el}
        className="fih__hotspot fih__hotspot--sign"
        href={SHOP_COLLECTIONS.all}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="fih__dot" />
        Shop the Orchard
      </a>
    </Html>
  );
}

/** Contact shadow far below the island — breathes against the bob, sinks + deepens with scroll. */
function ContactShadow({
  progressRef, shadowTex, reduced,
}: {
  progressRef: React.MutableRefObject<number>;
  shadowTex: THREE.CanvasTexture;
  reduced: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!mesh.current || !mat.current) return;
    const p = progressRef.current;
    if (reduced) { mat.current.opacity = 0.3; return; }
    const ms = clock.elapsedTime * 1000;
    const bob = Math.sin(ms / 1400); // same phase as the island bob
    const e = smooth(p);
    // island up -> shadow smaller + lighter; harvest weight -> darker, and the
    // shadow follows the island down as it sinks
    mesh.current.scale.setScalar(1 - bob * 0.05 + e * 0.1);
    mesh.current.position.y = -4.1 - 0.25 * e;
    mat.current.opacity = 0.16 + 0.18 * e - bob * 0.03;
  });

  return (
    <mesh ref={mesh} position={[0, -4.1, -1.2]}>
      <planeGeometry args={[9, 2.2]} />
      <meshBasicMaterial ref={mat} map={shadowTex} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** A soft cloud shadow drifting slowly across the moss — the sky is alive. */
function CloudShadow({
  progressRef, shadowTex, speed, phase, y, strength,
}: {
  progressRef: React.MutableRefObject<number>;
  shadowTex: THREE.CanvasTexture;
  speed: number;
  phase: number;
  y: number;
  strength: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!mesh.current || !mat.current) return;
    const ms = clock.elapsedTime * 1000;
    const p = progressRef.current;
    // clouds hurry a little as the harvest builds
    mesh.current.position.x = Math.sin(ms / (speed / (1 + 0.5 * smooth(p))) + phase) * 3.8;
    // strongest mid-journey, when the mist is at its most mysterious
    mat.current.opacity = (0.05 + 0.11 * Math.sin(Math.PI * p)) * strength;
  });

  return (
    <mesh ref={mesh} position={[0, y, 0.03]}>
      <planeGeometry args={[7, 2.6]} />
      <meshBasicMaterial ref={mat} map={shadowTex} transparent opacity={0.05} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Gold pollen motes drifting up through the orchard — subtle ambient life. */
const MOTE_COUNT = 64;
function Motes({ moteTex, progressRef }: { moteTex: THREE.CanvasTexture; progressRef: React.MutableRefObject<number> }) {
  const points = useRef<THREE.Points>(null);
  const seeds = useMemo(() => Array.from({ length: MOTE_COUNT }, (_, i) => ({
    phase: i * 2.399, // golden-angle spread, deterministic
    speed: 0.005 + (i % 7) * 0.0018,
  })), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i++) {
      pos[i * 3] = Math.sin(i * 12.9898) * 7;               // x  -7..7
      pos[i * 3 + 1] = ((i * 37) % 70) / 10 - 3;             // y  -3..4
      pos[i * 3 + 2] = Math.sin(i * 4.7) * 0.65 - 0.15;      // z  -0.8..0.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(({ clock }, delta) => {
    if (!points.current) return;
    const ms = clock.elapsedTime * 1000;
    const chaos = 1 + 1.2 * smooth(progressRef.current);
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < MOTE_COUNT; i++) {
      pos[i * 3 + 1] += seeds[i].speed * delta * 60 * chaos;
      pos[i * 3] += Math.sin(ms / 3000 + seeds[i].phase) * 0.0012 * delta * 60 * chaos;
      if (pos[i * 3 + 1] > 4.4) pos[i * 3 + 1] = -3.4;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geo}>
      <pointsMaterial map={moteTex} color="#d4a017" size={0.085} sizeAttenuation transparent opacity={0.55} depthWrite={false} toneMapped={false} />
    </points>
  );
}

/** Twinkling gold sparkles among the foliage — two counter-phase groups, brighter as the harvest ripens. */
const SPARK_COUNT = 16;
function Sparkles({
  sparkTex, progressRef, phase,
}: {
  sparkTex: THREE.CanvasTexture;
  progressRef: React.MutableRefObject<number>;
  phase: number;
}) {
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(SPARK_COUNT * 3);
    for (let i = 0; i < SPARK_COUNT; i++) {
      pos[i * 3] = Math.sin((i + phase) * 5.03) * 6.2;       // x across the orchard
      pos[i * 3 + 1] = Math.sin((i + phase) * 9.11) * 1.8 + 0.9; // y in the foliage band
      pos[i * 3 + 2] = 0.32 + ((i + phase) % 4) * 0.05;      // z in front of the trees
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [phase]);

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(({ clock }) => {
    if (!mat.current) return;
    const ms = clock.elapsedTime * 1000;
    const ripeness = 0.3 + 0.7 * smooth(progressRef.current);
    mat.current.opacity = (0.06 + 0.5 * (0.5 + 0.5 * Math.sin(ms / 640 + phase))) * ripeness;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial ref={mat} map={sparkTex} color="#e8c04a" size={0.16} sizeAttenuation transparent opacity={0.1} depthWrite={false} toneMapped={false} />
    </points>
  );
}

/** Leaves + grass blades lazily circulating around the island, one instanced draw per depth band. */
function DriftingLeaves({
  leafTex, count, zBase, zSpread, tint, progressRef,
}: {
  leafTex: THREE.CanvasTexture;
  count: number;
  zBase: number;
  zSpread: number;
  tint: 'green' | 'mixed';
  progressRef: React.MutableRefObject<number>;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    bx: Math.sin(i * 12.9898 + zBase) * 7.2,
    by: ((i * 53) % 60) / 10 - 2.6,
    bz: Math.sin(i * 3.3) * zSpread,
    orbit: 0.6 + ((i * 13) % 10) / 10,           // orbit radius
    w: 0.00008 + ((i * 7) % 10) * 0.000022,      // orbit speed
    spin: (((i * 11) % 10) / 10 - 0.5) * 0.0016, // rotation speed
    scale: 0.1 + ((i * 17) % 10) / 10 * 0.16,
    phase: i * 2.399,
  })), [count, zBase, zSpread]);

  useEffect(() => {
    if (!mesh.current) return;
    const greens = ['#3d8b3d', '#5aa04f', '#7bb069', '#2f6e33'];
    const mixed = [...greens, '#c9a86a', '#b98d4f'];
    const palette = tint === 'green' ? greens : mixed;
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      mesh.current.setColorAt(i, col.set(palette[i % palette.length]));
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [count, tint]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const ms = clock.elapsedTime * 1000;
    const chaos = 1 + 1.2 * smooth(progressRef.current);
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      dummy.position.set(
        s.bx + Math.cos(ms * s.w * chaos + s.phase) * s.orbit,
        s.by + Math.sin(ms * s.w * 0.7 * chaos + s.phase) * s.orbit * 0.55,
        s.bz,
      );
      dummy.rotation.z = s.phase + ms * s.spin * chaos;
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0, 0, zBase]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={leafTex} transparent opacity={0.85} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
}

/** Bob + sway + scroll-driven sink/tilt/growth on the island group; pointer orbit + scroll dolly on the camera. */
function IslandRig({
  progressRef, travelRef, poseRef, reduced, children,
}: {
  progressRef: React.MutableRefObject<number>;
  /** 0 while the hero beat runs, then 0→1 across the rest of the page. */
  travelRef: React.MutableRefObject<number>;
  /** Where the island should sit right now, derived from the rooms' lanes. */
  poseRef: React.MutableRefObject<Pose>;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  useFrame(({ camera, clock }) => {
    if (reduced || !group.current) return;
    const g = group.current;
    const ms = clock.elapsedTime * 1000;
    const p = progressRef.current;
    const e = smooth(p);
    // closing beat: the island parks to the left while the featured-product
    // panel blooms in on the right (see FeaturedHarvest / onUpdate driver)
    const park = smooth(clamp((p - 0.8) / 0.16, 0, 1));
    // idle life is layered sines; everything gets a little wilder as the
    // harvest ripens (chaos), while the island sinks, tilts and grows
    const chaos = 1 + 0.4 * e;
    const bob = (Math.sin(ms / 1400) * 0.12 + Math.sin(ms / 530) * 0.02) * chaos;
    const sway = Math.sin(ms / 2600) * 0.009 + Math.sin(ms / 970) * 0.003;

    // ---- hero pose (ripening) ----
    let px = lerp(0, -2.7, park);
    // The island ENTERS: it opens sitting low and a touch small, clear of the
    // headline, then rises and grows as the harvest ripens. Two jobs at once —
    // it stops the canopy colliding with the hero copy at scroll 0, and it
    // gives the page an opening beat instead of starting fully arrived.
    let py = BASE_Y + bob + lerp(-0.92, -0.06, e);
    let ps = BASE_S * lerp(0.9, 1.08, e) * lerp(1, 0.9, park);
    let pr = sway * (1 + 1.1 * e);

    // ---- travel: once the hero beat is spent, ride the rooms' lanes ----
    const tv = travelRef.current;
    if (tv > 0) {
      const pose = poseRef.current;
      // The island never parks. On top of the lane pose it keeps a wide, slow
      // orbit plus a faster wobble, so it is ALWAYS moving through the page —
      // drifting in and out of its corridor rather than sitting in it.
      // drift stays inside the reserved corridor — wide enough to feel alive,
      // never so wide that it wanders onto the copy
      const driftX = Math.sin(ms / 5200) * 0.85 + Math.sin(ms / 2100) * 0.3;
      const driftY = Math.cos(ms / 4300) * 0.9 + Math.sin(ms / 1700) * 0.25;
      const breathe = 1 + Math.sin(ms / 6100) * 0.09; // grows and shrinks as it goes
      const tumble = Math.sin(ms / 3300) * 0.09 + Math.sin(ms / 1250) * 0.03;

      // blend out of the hero pose over the first slice of travel so the
      // hand-off is a continuous glide, not a jump
      const blend = smooth(clamp(tv / 0.06, 0, 1));
      px = lerp(px, pose.x + driftX, blend);
      py = lerp(py, pose.y + driftY + bob * 0.8, blend);
      ps = lerp(ps, BASE_S * pose.s * breathe, blend);
      pr = lerp(pr, pose.rot + tumble + sway * 2.2, blend);
    }

    g.position.x = px;
    g.position.y = py;
    g.rotation.z = pr;
    g.rotation.x = lerp(0.018, -0.045, e);
    g.scale.setScalar(ps);
    // damped pointer orbit + a slow dolly-in with scroll — the journey draws you closer
    // (pointer orbit eases off during travel so the flight path stays readable)
    const orbit = 1 - smooth(clamp(travelRef.current / 0.1, 0, 1)) * 0.75;
    const tx = pointer.current.x * 2.6 * orbit;
    const ty = -pointer.current.y * 1.4 * orbit;
    const tz = CAM_DIST - 0.5 * e;
    camera.position.x += (tx - camera.position.x) * 0.06;
    camera.position.y += (ty - camera.position.y) * 0.06;
    camera.position.z += (tz - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  // reduced motion: a single static composition — island parked left, ripe,
  // with the product panel sitting on the right (set once, no frame loop)
  return (
    <group ref={group} position={[reduced ? -2.2 : 0, BASE_Y, 0]} scale={reduced ? BASE_S * 0.92 : BASE_S}>
      {children}
    </group>
  );
}

export default function FloatingIslandHero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const titlesRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  /** 0 during the hero beat, then 0→1 across the remaining rooms. */
  const travelRef = useRef(0);
  /** Live target pose, recomputed from the rooms' reserved lanes. */
  const poseRef = useRef<Pose>(EXIT_POSE);
  /** Document-space centre + side of every room that reserves an island lane. */
  const lanesRef = useRef<LaneAnchor[]>([]);
  const [pending, setPending] = useState(CRITICAL_COUNT);

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const shadowTex = useMemo(() => makeShadowTexture(), []);
  const moteTex = useMemo(() => makeMoteTexture(), []);
  const sparkTex = useMemo(() => makeSparkTexture(), []);
  const leafTex = useMemo(() => makeLeafTexture(), []);
  const markReady = useCallback(() => setPending((n) => n - 1), []);

  useEffect(() => () => {
    shadowTex.dispose(); moteTex.dispose(); sparkTex.dispose(); leafTex.dispose();
  }, [shadowTex, moteTex, sparkTex, leafTex]);

  useEffect(() => {
    if (reduced) {
      progressRef.current = 1; // still, ripe, shoppable
      if (glowRef.current) glowRef.current.style.opacity = '0.9';
      if (finaleRef.current) { finaleRef.current.style.opacity = '1'; finaleRef.current.style.transform = 'none'; }
      return;
    }
    // ONE global scroll driver for the whole page. The stage is position:fixed,
    // so the island rides along for the entire journey; the hero section's own
    // height is just the runway for the ripening beat. (A pinned ScrollTrigger
    // is deliberately avoided here — pin state goes stale under Vite HMR, and
    // a fixed stage needs no pinning.)
    let frame = 0;

    // Measure every room that reserves a corridor for the island. Re-measured on
    // resize (and once after load) so the flight always matches the real layout.
    const measureLanes = () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-island-lane]'),
      );
      lanesRef.current = nodes
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            center: r.top + window.scrollY + r.height / 2,
            side: (el.dataset.islandLane as IslandLane) || 'right',
          };
        })
        .sort((a, b) => a.center - b.center);
    };

    const read = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const g = clamp(window.scrollY / max, 0, 1);
      // the island always heads for the corridor of whichever room is nearest
      // the middle of the viewport
      const raw = poseFromLanes(
        lanesRef.current,
        window.scrollY + window.innerHeight / 2,
      );
      // Narrow viewports can't spare a wide corridor (see the .lane-- rules),
      // so the island tucks further off-frame and shrinks — it keeps poking in
      // rather than sitting on top of the copy.
      const w = window.innerWidth;
      const tuck = w >= 1200 ? 1 : w >= 880 ? 1.22 : 1.5;
      const shrink = w >= 1200 ? 1 : w >= 880 ? 0.84 : 0.66;
      poseRef.current = {
        ...raw,
        x: raw.x * tuck,
        s: raw.s * shrink,
      };

      // the hero beat owns the first stretch of the page (its section height);
      // everything after it is travel
      const heroPx = Math.max(sectionRef.current?.offsetHeight ?? 0, window.innerHeight);
      const heroEnd = clamp((heroPx - window.innerHeight) / max, 0.02, 0.98);

      const p = clamp(g / heroEnd, 0, 1);
      const travel = clamp((g - heroEnd) / Math.max(1 - heroEnd, 0.001), 0, 1);
      progressRef.current = p;
      travelRef.current = travel;

      const e = smooth(p);
      // color journey: neutral -> cool mist (mid) -> golden hour (end);
      // the titles hand the stage over to the island as the story unfolds
      if (glowRef.current) glowRef.current.style.opacity = String(e * (1 - travel));
      if (mistRef.current) mistRef.current.style.opacity = String(Math.sin(Math.PI * p) * 0.85 * (1 - travel));
      if (titlesRef.current) titlesRef.current.style.opacity = String((1 - 0.85 * e) * (1 - smooth(clamp(travel / 0.04, 0, 1))));

      // flying = scenery mode: no hotspots, no stage backdrop
      sectionRef.current?.classList.toggle('fih--flying', travel > 0.02);
      // the stage's own backdrop dissolves as the island leaves the hero, so the
      // content rooms below become the page background
      if (backdropRef.current) {
        backdropRef.current.style.opacity = String(1 - smooth(clamp(travel / 0.05, 0, 1)));
      }
      // the island stays essentially opaque the whole way — it travels through
      // reserved corridors rather than over the copy, so it never needs hiding
      if (wrapRef.current) {
        wrapRef.current.style.opacity = String(travel > 0 ? poseRef.current.op : 1);
      }

      // Chippy + laser engraver signs off the hero, then clears out for travel
      if (finaleRef.current) {
        const k = clamp((p - 0.84) / 0.13, 0, 1) * (1 - smooth(clamp(travel / 0.04, 0, 1)));
        finaleRef.current.style.opacity = String(k);
        finaleRef.current.style.transform = `translateY(${(1 - k) * 36}px)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    const onResize = () => {
      measureLanes();
      onScroll();
    };
    measureLanes();
    read();
    // images/fonts settling can move the rooms — re-measure shortly after mount
    const settle = window.setTimeout(onResize, 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} className="fih fih--r3f">
      <div ref={stageRef} className="fih__stage">
        <div ref={backdropRef} className="fih__backdrop" aria-hidden="true" />
        <div ref={titlesRef} className="fih__titles">
          <h1>Premium Quality.<span>Hand sourced from across the Globe.</span></h1>
          <p>{reduced ? 'Every branch heavy with harvest.' : 'Scroll to watch the harvest ripen.'}</p>
        </div>
        <div ref={wrapRef} className="fih__wrap">
          <Canvas
            dpr={[1, 2]}
            flat
            frameloop={reduced ? 'demand' : 'always'}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            camera={{ fov: CAM_FOV, near: 1, far: 60, position: [0, 0, CAM_DIST] }}
          >
            <ContactShadow progressRef={progressRef} shadowTex={shadowTex} reduced={reduced} />
            <IslandRig progressRef={progressRef} travelRef={travelRef} poseRef={poseRef} reduced={reduced}>
              {!reduced && (
                <DriftingLeaves leafTex={leafTex} count={30} zBase={-1.1} zSpread={0.35} tint="green" progressRef={progressRef} />
              )}
              <LayerPlane url={asset('layers/roots.webp')} z={ROOTS_Z} onReady={markReady} />
              <LayerPlane url={asset('layers/surface.webp')} z={SURFACE_Z} onReady={markReady} />
              {!reduced && (
                <>
                  <CloudShadow progressRef={progressRef} shadowTex={shadowTex} speed={8000} phase={0} y={0.5} strength={1} />
                  <CloudShadow progressRef={progressRef} shadowTex={shadowTex} speed={5400} phase={2.6} y={1.15} strength={0.65} />
                </>
              )}
              {TREES.map((t, i) => (
                <MaturingTree
                  key={t.id}
                  t={t}
                  index={i}
                  progressRef={progressRef}
                  shadowTex={shadowTex}
                  reduced={reduced}
                  onReady={markReady}
                />
              ))}
              {/* one sign for the whole orchard */}
              <IslandSign progressRef={progressRef} />
              {/* ambient wildlife: two chipmunks chasing across the moss —
                  procedural choreography, hidden entirely on reduced motion */}
              {!reduced && <ChipmunkChase progressRef={progressRef} shadowTex={shadowTex} />}
              {!reduced && (
                <>
                  <DriftingLeaves leafTex={leafTex} count={26} zBase={0.45} zSpread={0.15} tint="mixed" progressRef={progressRef} />
                  <Motes moteTex={moteTex} progressRef={progressRef} />
                  <Sparkles sparkTex={sparkTex} progressRef={progressRef} phase={0} />
                  <Sparkles sparkTex={sparkTex} progressRef={progressRef} phase={Math.PI} />
                </>
              )}
            </IslandRig>
          </Canvas>
        </div>
        <div ref={mistRef} className="fih__mist" />
        <div ref={glowRef} className="fih__glow" />
        {/* The hero's closing beat is Chippy at the engraver + a scroll cue that
            hands you into the store room below. (The old floating product panel
            lived here; it duplicated the Harvest room directly beneath it, which
            is exactly what made this seam feel abrupt.) */}
        <div ref={finaleRef} className="fih__finale">
          <img
            src={`${BASE}brand/chippy-laser.webp`.replace(/\/{2,}/g, '/')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <span className="fih__finale-cue">Keep scrolling — the store is just below</span>
        </div>
        <div className={`fih__loader${pending <= 0 ? ' fih__loader--done' : ''}`} aria-hidden={pending <= 0}>
          <span className="fih__dot" />
          Tending the orchard…
        </div>
      </div>
    </section>
  );
}
