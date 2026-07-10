import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SHOP_COLLECTIONS } from '../config';
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
  { id: 'almond',    frames: 61, left: 2.3,  top: 0.9,  w: 21.2, h: 50.3, win: [0.00, 0.34], z: 0.12, shop: true,  label: 'Shop Almonds',    href: NUTS },
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
const BASE_S = 0.76;
const BASE_Y = -0.7;

// critical assets gating the loader: 2 island layers + 1 first frame per tree
const CRITICAL_COUNT = 2 + TREES.length;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const BASE = (import.meta as any).env?.BASE_URL ?? '/';
const asset = (p: string) => `${BASE}hero/${p}`.replace(/\/{2,}/g, '/');
const frameUrl = (id: string, i: number) => asset(`seq828/${id}/f_${String(i + 1).padStart(2, '0')}.webp`);

/** Compensation so a plane at depth z shows the exact manifest footprint on screen. */
const depthScale = (z: number) => (CAM_DIST - z) / CAM_DIST;

/** Recreates the 2D version's CSS mask feather (radial-gradient ellipse) as a shared alphaMap. */
function makeFeatherTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 342; // ~3:4, matches the tree plane aspect
  const ctx = c.getContext('2d')!;
  const cx = c.width * 0.5, cy = c.height * 0.47;
  const rx = c.width * 0.5 * 0.93, ry = c.height * 0.5 * 0.96;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, '#fff');
  g.addColorStop(0.62, '#fff');
  g.addColorStop(0.95, '#000');
  g.addColorStop(1, '#000');
  ctx.fillStyle = g;
  ctx.fillRect(-cx, (-cy * rx) / ry, c.width, (c.height * rx) / ry);
  ctx.restore();
  return new THREE.CanvasTexture(c);
}

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
  t, index, progressRef, feather, shadowTex, reduced, onReady,
}: {
  t: Tree;
  index: number;
  progressRef: React.MutableRefObject<number>;
  feather: THREE.CanvasTexture;
  shadowTex: THREE.CanvasTexture;
  reduced: boolean;
  onReady: () => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const hotspotEl = useRef<HTMLAnchorElement>(null);
  const groupEl = useRef<THREE.Group>(null);
  const shadowEl = useRef<THREE.Mesh>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const rt = useRef<{ imgs: (HTMLImageElement | undefined)[]; cur: number; pulseStart: number }>(
    { imgs: new Array(t.frames), cur: -1, pulseStart: -1 },
  );

  const { ctx, tex } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 828; canvas.height = 1108;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { ctx, tex };
  }, []);

  const drawFrame = useCallback((f: number) => {
    const img = rt.current.imgs[f];
    if (!img) return;
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
    load(critical, () => { drawFrame(critical); onReady(); });
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
    if (hotspotEl.current) hotspotEl.current.classList.toggle('on', local >= 0.88);
    // maturation deepens the tree's ground shadow; scroll shifts it — the sun moving
    if (shadowMat.current) shadowMat.current.opacity = 0.1 + 0.3 * local;
    if (shadowEl.current) shadowEl.current.position.x = w * lerp(-0.06, 0.12, smooth(p));
    if (reduced || !groupEl.current) return;
    const ms = clock.elapsedTime * 1000;
    // breeze sway from the base, phase-offset per tree
    groupEl.current.rotation.z = Math.sin(ms / 1900 + index * 1.7) * 0.012;
    // one satisfying pulse the moment the tree finishes ripening
    if (local >= 1 && rt.current.pulseStart < 0) rt.current.pulseStart = ms;
    let pulse = 1;
    if (rt.current.pulseStart >= 0) {
      const k = clamp((ms - rt.current.pulseStart) / 420, 0, 1);
      pulse = 1 + 0.05 * Math.sin(k * Math.PI);
    }
    groupEl.current.scale.setScalar(s * pulse);
  });

  // hotspot anchor: same stage % as the 2D version (left + w*0.52, top + h*0.3), now relative to base pivot
  const hx = ((t.w * 0.02) / 100) * STAGE_W;
  const hy = h * 0.7;

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
        <meshBasicMaterial map={tex} alphaMap={feather} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {t.shop && (
        <Html position={[hx, hy, 0.01]} center wrapperClass="fih__hotspot-wrap">
          <a ref={hotspotEl} className="fih__hotspot" href={t.href} target="_blank" rel="noopener noreferrer">
            <span className="fih__dot" />
            {t.label}
          </a>
        </Html>
      )}
    </group>
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
    mesh.current.position.y = -4.0 - 0.25 * e;
    mat.current.opacity = 0.16 + 0.18 * e - bob * 0.03;
  });

  return (
    <mesh ref={mesh} position={[0, -4.0, -1.2]}>
      <planeGeometry args={[9, 2.2]} />
      <meshBasicMaterial ref={mat} map={shadowTex} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** A soft cloud shadow drifting slowly across the moss — the sky is alive. */
function CloudShadow({
  progressRef, shadowTex,
}: {
  progressRef: React.MutableRefObject<number>;
  shadowTex: THREE.CanvasTexture;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!mesh.current || !mat.current) return;
    const ms = clock.elapsedTime * 1000;
    mesh.current.position.x = Math.sin(ms / 8000) * 3.8;
    // strongest mid-journey, when the mist is at its most mysterious
    mat.current.opacity = 0.05 + 0.11 * Math.sin(Math.PI * progressRef.current);
  });

  return (
    <mesh ref={mesh} position={[0, 0.5, 0.03]}>
      <planeGeometry args={[7, 2.6]} />
      <meshBasicMaterial ref={mat} map={shadowTex} transparent opacity={0.05} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Gold pollen motes drifting up through the orchard — subtle ambient life. */
const MOTE_COUNT = 64;
function Motes({ moteTex }: { moteTex: THREE.CanvasTexture }) {
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
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < MOTE_COUNT; i++) {
      pos[i * 3 + 1] += seeds[i].speed * delta * 60;
      pos[i * 3] += Math.sin(ms / 3000 + seeds[i].phase) * 0.0012 * delta * 60;
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
  leafTex, count, zBase, zSpread, tint,
}: {
  leafTex: THREE.CanvasTexture;
  count: number;
  zBase: number;
  zSpread: number;
  tint: 'green' | 'mixed';
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
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      dummy.position.set(
        s.bx + Math.cos(ms * s.w + s.phase) * s.orbit,
        s.by + Math.sin(ms * s.w * 0.7 + s.phase) * s.orbit * 0.55,
        s.bz,
      );
      dummy.rotation.z = s.phase + ms * s.spin;
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
  progressRef, reduced, children,
}: {
  progressRef: React.MutableRefObject<number>;
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
    const e = smooth(progressRef.current);
    // float + slow lateral sway; the island sinks, tilts and grows as the
    // harvest ripens down the page — weight gathering in the branches
    g.position.y = BASE_Y + Math.sin(ms / 1400) * 0.14 + lerp(0.15, -0.3, e);
    g.rotation.z = Math.sin(ms / 2600) * 0.009;
    g.rotation.x = lerp(0.018, -0.045, e);
    g.scale.setScalar(BASE_S * lerp(1.0, 1.08, e));
    // damped pointer orbit + a slow dolly-in with scroll — the journey draws you closer
    const tx = pointer.current.x * 2.6;
    const ty = -pointer.current.y * 1.4;
    const tz = CAM_DIST - 0.9 * e;
    camera.position.x += (tx - camera.position.x) * 0.06;
    camera.position.y += (ty - camera.position.y) * 0.06;
    camera.position.z += (tz - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group} position={[0, BASE_Y, 0]} scale={BASE_S}>{children}</group>;
}

export default function FloatingIslandHero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const titlesRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [pending, setPending] = useState(CRITICAL_COUNT);

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const feather = useMemo(() => makeFeatherTexture(), []);
  const shadowTex = useMemo(() => makeShadowTexture(), []);
  const moteTex = useMemo(() => makeMoteTexture(), []);
  const sparkTex = useMemo(() => makeSparkTexture(), []);
  const leafTex = useMemo(() => makeLeafTexture(), []);
  const markReady = useCallback(() => setPending((n) => n - 1), []);

  useEffect(() => () => {
    feather.dispose(); shadowTex.dispose(); moteTex.dispose(); sparkTex.dispose(); leafTex.dispose();
  }, [feather, shadowTex, moteTex, sparkTex, leafTex]);

  useEffect(() => {
    if (reduced) {
      progressRef.current = 1; // still, ripe, shoppable
      if (glowRef.current) glowRef.current.style.opacity = '0.9';
      return;
    }
    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top top',
      end: '+=360%',
      pin: stageRef.current!,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        const e = smooth(p);
        // color journey: neutral -> cool mist (mid) -> golden hour (end);
        // the titles hand the stage over to the island as the story unfolds
        if (glowRef.current) glowRef.current.style.opacity = String(e);
        if (mistRef.current) mistRef.current.style.opacity = String(Math.sin(Math.PI * p) * 0.85);
        if (titlesRef.current) titlesRef.current.style.opacity = String(1 - 0.85 * e);
      },
    });
    return () => st.kill();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="fih fih--r3f">
      <div ref={stageRef} className="fih__stage">
        <div ref={titlesRef} className="fih__titles">
          <h1>Premium Quality.<span>Hand sourced from across the Globe.</span></h1>
          <p>{reduced ? 'Every branch heavy with harvest.' : 'Scroll to watch the harvest ripen.'}</p>
        </div>
        <div className="fih__wrap">
          <Canvas
            dpr={[1, 2]}
            flat
            frameloop={reduced ? 'demand' : 'always'}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            camera={{ fov: CAM_FOV, near: 1, far: 60, position: [0, 0, CAM_DIST] }}
          >
            <ContactShadow progressRef={progressRef} shadowTex={shadowTex} reduced={reduced} />
            <IslandRig progressRef={progressRef} reduced={reduced}>
              {!reduced && (
                <DriftingLeaves leafTex={leafTex} count={22} zBase={-1.1} zSpread={0.35} tint="green" />
              )}
              <LayerPlane url={asset('layers/roots.webp')} z={ROOTS_Z} onReady={markReady} />
              <LayerPlane url={asset('layers/surface.webp')} z={SURFACE_Z} onReady={markReady} />
              {!reduced && <CloudShadow progressRef={progressRef} shadowTex={shadowTex} />}
              {TREES.map((t, i) => (
                <MaturingTree
                  key={t.id}
                  t={t}
                  index={i}
                  progressRef={progressRef}
                  feather={feather}
                  shadowTex={shadowTex}
                  reduced={reduced}
                  onReady={markReady}
                />
              ))}
              {!reduced && (
                <>
                  <DriftingLeaves leafTex={leafTex} count={18} zBase={0.45} zSpread={0.15} tint="mixed" />
                  <Motes moteTex={moteTex} />
                  <Sparkles sparkTex={sparkTex} progressRef={progressRef} phase={0} />
                  <Sparkles sparkTex={sparkTex} progressRef={progressRef} phase={Math.PI} />
                </>
              )}
            </IslandRig>
          </Canvas>
        </div>
        <div ref={mistRef} className="fih__mist" />
        <div ref={glowRef} className="fih__glow" />
        <div className={`fih__loader${pending <= 0 ? ' fih__loader--done' : ''}`} aria-hidden={pending <= 0}>
          <span className="fih__dot" />
          Tending the orchard…
        </div>
      </div>
    </section>
  );
}
