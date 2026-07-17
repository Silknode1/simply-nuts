import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * ChipmunkChase — ambient wildlife for the floating-island journey.
 * ------------------------------------------------------------------
 * Two photoreal chipmunks chase each other across the island surface.
 * The four MP4s (public/chipmunks/{run,leap,idle,peek}.mp4, chroma green
 * ≈ #009440) are a MOTION VOCABULARY, not routes — all movement here is
 * procedural:
 *
 *  - a waypoint graph across the moss surface; randomized speed, pauses
 *    and path per critter so nothing reads as a canned loop
 *  - run loop plays while the plane translates; horizontal flip = heading
 *  - leap one-shot fires on long gaps / sharp turns (one leap at a time)
 *  - idle (nibble/look-around) on pauses
 *  - hide: critters route BEHIND a tree billboard's depth plane (z-order
 *    occlusion — the tree paints over them), dwell, play the peek one-shot,
 *    then dart back out — this is what makes them feel alive
 *  - critter B trails critter A's waypoint history (rubber-band chase);
 *    when A hides, B "loses the scent" and idles until A reappears
 *
 * Rendering: GPU chroma key via ShaderMaterial over four shared
 * VideoTextures — zero per-frame CPU pixel work. Depth against the island
 * comes for free: a critter's z is derived from its stage-y (lower on
 * screen = nearer = higher z), so trees whose z is greater paint over it
 * and vice versa, matching the billboard stack.
 *
 * prefers-reduced-motion: the parent skips mounting this component
 * entirely (no videos are created). Mobile (<768px) runs a single critter.
 */

/* Stage constants — MUST match FloatingIslandHero3D.tsx. */
const STAGE_W = 16;
const STAGE_H = 9;
const CAM_FOV = 20;
const CAM_DIST = STAGE_H / 2 / Math.tan(((CAM_FOV / 2) * Math.PI) / 180);
const depthScale = (z: number) => (CAM_DIST - z) / CAM_DIST;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BASE = (import.meta as any).env?.BASE_URL ?? '/';
const clipUrl = (name: string) => `${BASE}chipmunks/${name}.mp4`.replace(/\/{2,}/g, '/');

const CLIPS = ['run', 'leap', 'idle', 'peek'] as const;
type ClipName = (typeof CLIPS)[number];
const LOOPING: Record<ClipName, boolean> = { run: true, idle: true, leap: false, peek: false };

/* --- the island's walkable geography (stage %, same space as the trees) --- */

type Pt = { x: number; y: number };

/** Moss-surface waypoints: front rim lower (y≈57-60), back row higher (y≈46-48). */
const WAYPOINTS: Pt[] = [
  { x: 13, y: 56 }, { x: 21, y: 59 }, { x: 30, y: 53 }, { x: 38, y: 58 },
  { x: 47, y: 54 }, { x: 55, y: 59 }, { x: 63, y: 55 }, { x: 71, y: 58 },
  { x: 80, y: 54 }, { x: 87, y: 57 },
  { x: 27, y: 47 }, { x: 45, y: 47 }, { x: 61, y: 47 }, { x: 76, y: 46 },
];

/** Hide spots: trunk-center of a tree billboard + the z just behind its plane.
    Derived from the TREES manifest in FloatingIslandHero3D. */
const HIDE_SPOTS: Array<Pt & { z: number }> = [
  { x: 12.9, y: 50, z: 0.12 - 0.02 }, // almond
  { x: 40.3, y: 49, z: 0.10 - 0.02 }, // cashew
  { x: 51.9, y: 51, z: 0.16 - 0.02 }, // pistachio
  { x: 64.7, y: 50, z: 0.08 - 0.02 }, // walnut
  { x: 81.7, y: 51, z: 0.14 - 0.02 }, // pecan
];

/** Open-field depth from stage-y: front rim (y 62) → z .24, back row (y 44) → z .03.
    Trees sit at z .05–.20, so passing in front/behind sorts correctly. */
const zFromY = (y: number) => 0.03 + clamp((y - 44) / 18, 0, 1) * 0.21;

/* --- GPU chroma key --------------------------------------------------------- */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Key on green dominance (flat #009440 backdrop), with spill suppression on
   the fur rim. Videos are left in their raw sRGB values (no colorSpace set)
   so output matches the flat-rendered billboard stack. */
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFlip;     // 1 = face right (native), -1 = mirrored left
  uniform float uOpacity;
  uniform vec3 uTint;
  varying vec2 vUv;
  void main() {
    vec2 uv = vec2(uFlip > 0.0 ? vUv.x : 1.0 - vUv.x, vUv.y);
    vec4 c = texture2D(uMap, uv);
    float g = c.g - max(c.r, c.b);
    float alpha = 1.0 - smoothstep(0.03, 0.16, g);
    c.g = min(c.g, max(c.r, c.b) + 0.045); // spill suppression
    float a = alpha * uOpacity;
    if (a < 0.02) discard;
    gl_FragColor = vec4(c.rgb * uTint, a);
  }
`;

/* --- choreography ----------------------------------------------------------- */

type CritterState = 'run' | 'leap' | 'idle' | 'hidden' | 'peek';

type Critter = {
  pos: Pt;
  from: Pt;
  to: Pt;
  t: number;          // 0..1 along the current segment
  segDur: number;     // seconds
  state: CritterState;
  until: number;      // ms deadline for idle/hidden/peek
  clip: ClipName;
  facing: 1 | -1;
  hideZ: number;      // z while hidden/peeking (behind a tree plane)
  speed: number;      // world-ish pace multiplier, randomized per critter
  scale: number;
  tint: THREE.Vector3;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, (a.y - b.y) * 1.9); // y counts ~2× (stage is wide)

function makeCritter(start: Pt, scale: number, tint: THREE.Vector3, speed: number): Critter {
  return {
    pos: { ...start }, from: { ...start }, to: { ...start },
    t: 1, segDur: 1, state: 'idle', until: performance.now() + rnd(400, 1600),
    clip: 'idle', facing: 1, hideZ: 0.1, speed, scale, tint,
  };
}

export default function ChipmunkChase({
  progressRef, shadowTex,
}: {
  progressRef: React.MutableRefObject<number>;
  shadowTex: THREE.CanvasTexture;
}) {
  const [ready, setReady] = useState(false);
  const single = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
    [],
  );

  const rig = useRef<{
    videos: Record<ClipName, HTMLVideoElement>;
    textures: Record<ClipName, THREE.VideoTexture>;
  } | null>(null);

  // A leads, B chases. B is a touch smaller + warmer so they read as two animals.
  const critters = useRef<Critter[]>([]);
  const trail = useRef<Pt[]>([]);        // A's recent waypoints — B's breadcrumb path
  const leaping = useRef(false);         // only one airborne critter at a time

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const shadowRefs = useRef<(THREE.Mesh | null)[]>([]);

  /* video + texture lifecycle (StrictMode-safe: everything in one effect) */
  useEffect(() => {
    const videos = {} as Record<ClipName, HTMLVideoElement>;
    const textures = {} as Record<ClipName, THREE.VideoTexture>;
    let alive = true;

    const readiness = CLIPS.map((name) => {
      const v = document.createElement('video');
      v.src = clipUrl(name);
      v.muted = true;
      v.playsInline = true;
      v.loop = LOOPING[name];
      v.preload = 'auto';
      v.crossOrigin = 'anonymous';
      videos[name] = v;
      const tex = new THREE.VideoTexture(v);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      textures[name] = tex;
      return new Promise<void>((resolve) => {
        v.addEventListener('canplay', () => resolve(), { once: true });
        v.addEventListener('error', () => resolve(), { once: true }); // fail soft
      });
    });

    const playLoops = () => {
      videos.run.play().catch(() => undefined);
      videos.idle.play().catch(() => undefined);
    };
    // muted+playsInline autoplay is broadly allowed; retry on first gesture if not
    const gestureRetry = () => playLoops();
    window.addEventListener('pointerdown', gestureRetry, { once: true, passive: true });

    Promise.all(readiness).then(() => {
      if (!alive) return;
      playLoops();
      critters.current = [
        makeCritter(WAYPOINTS[2], 1.0, new THREE.Vector3(1, 1, 1), rnd(9, 11)),
        makeCritter(WAYPOINTS[7], 0.86, new THREE.Vector3(1.0, 0.93, 0.86), rnd(10, 12)),
      ];
      setReady(true);
    });

    rig.current = { videos, textures };
    return () => {
      alive = false;
      window.removeEventListener('pointerdown', gestureRetry);
      CLIPS.forEach((name) => {
        videos[name].pause();
        videos[name].removeAttribute('src');
        videos[name].load();
        textures[name].dispose();
      });
      rig.current = null;
    };
  }, []);

  const setClip = (c: Critter, i: number, name: ClipName) => {
    if (c.clip === name) return;
    c.clip = name;
    const r = rig.current;
    const mat = matRefs.current[i];
    if (!r || !mat) return;
    mat.uniforms.uMap.value = r.textures[name];
    if (!LOOPING[name]) {
      const v = r.videos[name];
      v.currentTime = 0;
      v.play().catch(() => undefined);
    }
  };

  const startSegment = (c: Critter, to: Pt, opts?: { leap?: boolean; dart?: boolean }) => {
    c.from = { ...c.pos };
    c.to = { ...to };
    c.t = 0;
    const d = dist(c.from, c.to);
    const pace = c.speed * (opts?.dart ? 1.45 : 1);
    c.segDur = opts?.leap ? rnd(0.95, 1.2) : Math.max(0.5, d / pace);
    c.state = opts?.leap ? 'leap' : 'run';
    if (Math.abs(c.to.x - c.from.x) > 0.75) c.facing = c.to.x > c.from.x ? 1 : -1;
  };

  const chooseNext = (c: Critter, i: number, now: number) => {
    const isLeader = i === 0;
    let target: Pt | undefined;
    if (!isLeader) {
      target = trail.current.shift(); // follow the leader's breadcrumbs
    }
    if (!target) {
      const near = WAYPOINTS.filter((w) => w !== c.to && dist(c.pos, w) > 4 && dist(c.pos, w) < 42);
      target = near[Math.floor(Math.random() * near.length)] ?? WAYPOINTS[0];
    }
    const far = dist(c.pos, target) > 26;
    const reversed = Math.sign(target.x - c.pos.x) !== c.facing && Math.abs(target.x - c.pos.x) > 6;
    const wantLeap = (far || reversed) && !leaping.current && Math.random() < 0.65;
    if (wantLeap) leaping.current = true;
    startSegment(c, target, { leap: wantLeap });
    setClip(c, i, wantLeap ? 'leap' : 'run');
    if (isLeader) {
      trail.current.push({ ...target });
      if (trail.current.length > 2) trail.current.shift();
    }
    void now;
  };

  const arrive = (c: Critter, i: number, now: number) => {
    if (c.state === 'leap') leaping.current = false;
    const isLeader = i === 0;
    const roll = Math.random();
    if (isLeader && roll < 0.16) {
      // duck behind the nearest tree and vanish for a beat
      const spot = [...HIDE_SPOTS].sort((a, b) => dist(c.pos, a) - dist(c.pos, b))[0];
      c.hideZ = spot.z;
      startSegment(c, spot, { dart: true });
      setClip(c, i, 'run');
      c.state = 'run';
      c.until = -1; // flag: this run segment ends in hiding
      return;
    }
    if (c.until === -1) {
      // just reached the hide spot — disappear behind the billboard
      c.state = 'hidden';
      c.until = now + rnd(1500, 4200);
      setClip(c, i, 'idle');
      return;
    }
    if (roll < 0.42) {
      c.state = 'idle';
      c.until = now + rnd(800, 2800);
      setClip(c, i, 'idle');
      return;
    }
    chooseNext(c, i, now);
  };

  useFrame((_, delta) => {
    if (!ready) return;
    const now = performance.now();
    const dt = Math.min(delta, 0.1);
    const cs = critters.current;
    const leaderCovert = cs[0] && (cs[0].state === 'hidden' || cs[0].state === 'peek');

    for (let i = 0; i < cs.length; i++) {
      if (single && i > 0) break;
      const c = cs[i];
      const group = groupRefs.current[i];
      const mat = matRefs.current[i];
      if (!group || !mat) continue;

      switch (c.state) {
        case 'run':
        case 'leap': {
          c.t += dt / c.segDur;
          if (c.t >= 1) {
            c.pos = { ...c.to };
            arrive(c, i, now);
          } else {
            c.pos.x = lerp(c.from.x, c.to.x, c.t);
            c.pos.y = lerp(c.from.y, c.to.y, c.t);
          }
          break;
        }
        case 'idle':
        case 'hidden': {
          // the chaser loses the scent while the leader is behind a tree
          if (i === 1 && leaderCovert) c.until = Math.max(c.until, now + 350);
          if (now >= c.until) {
            if (c.state === 'hidden') {
              c.state = 'peek';
              c.until = now + 1150;
              setClip(c, i, 'peek');
              c.facing = Math.random() < 0.5 ? 1 : -1;
            } else {
              chooseNext(c, i, now);
            }
          }
          break;
        }
        case 'peek': {
          if (now >= c.until) chooseNext(c, i, now); // dart back out
          break;
        }
      }

      // --- project stage % → island world space (matches the tree math) ---
      const covert = c.state === 'hidden' || c.state === 'peek' || c.until === -1;
      const z = covert ? c.hideZ : zFromY(c.pos.y);
      const s = depthScale(z);
      const wx = ((c.pos.x / 100) * STAGE_W - STAGE_W / 2) * s;
      let footY = (STAGE_H / 2 - (c.pos.y / 100) * STAGE_H) * s;
      let airborne = 0;
      if (c.state === 'leap') {
        airborne = Math.sin(clamp(c.t, 0, 1) * Math.PI);
        footY += airborne * 0.42 * s;
      }
      group.position.set(wx, footY, z);
      group.scale.setScalar(s * c.scale);
      mat.uniforms.uFlip.value = c.facing;
      // fade with the journey's final beat so the critters don't fight the shop panel
      mat.uniforms.uOpacity.value = 1 - 0.35 * clamp((progressRef.current - 0.86) / 0.14, 0, 1);

      const shadow = shadowRefs.current[i];
      if (shadow) {
        const sm = shadow.material as THREE.MeshBasicMaterial;
        sm.opacity = (covert ? 0 : 0.22) * (1 - 0.75 * airborne);
        shadow.scale.setScalar(1 - 0.25 * airborne);
      }
    }
  });

  if (!ready || !rig.current) return null;
  const count = single ? 1 : 2;
  const H = 0.78; // critter plane size in world units (square clips)

  return (
    <>
      {critters.current.slice(0, count).map((c, i) => (
        <group key={i} ref={(el) => { groupRefs.current[i] = el; }}>
          {/* contact shadow at the feet */}
          <mesh
            ref={(el) => { shadowRefs.current[i] = el; }}
            position={[0, 0.02, -0.005]}
          >
            <planeGeometry args={[H * 0.62, H * 0.16]} />
            <meshBasicMaterial map={shadowTex} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, H * 0.42, 0]}>
            <planeGeometry args={[H, H]} />
            <shaderMaterial
              ref={(el) => { matRefs.current[i] = el; }}
              vertexShader={VERT}
              fragmentShader={FRAG}
              uniforms={{
                uMap: { value: rig.current!.textures[c.clip] },
                uFlip: { value: c.facing },
                uOpacity: { value: 1 },
                uTint: { value: c.tint },
              }}
              transparent
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
