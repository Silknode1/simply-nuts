import { useEffect, useRef } from 'react';
import './ridge.css';

/**
 * RidgeDivider — a parallaxing depth band between two content rooms.
 * ------------------------------------------------------------------
 * Instead of butting two flat backgrounds together, each seam gets a small
 * landscape: 3–4 silhouette layers (far → near) that drift at different rates
 * as the seam crosses the viewport. The far layers barely move, the near ones
 * slide fast — which is what actually reads as distance.
 *
 * Each variant draws different terrain so no two seams look alike:
 *   ridge    — jagged mountain range (the classic "distance" cue)
 *   pines    — a conifer treeline marching across
 *   dunes    — soft rolling prairie hills
 *   skyline  — fairground silhouette (ferris wheel, tents, grandstand)
 *
 * Colours are passed in so the band can gradient FROM the room above INTO the
 * room below, making the tone change feel like travelling rather than cutting.
 *
 * Motion is transform-only and driven by one rAF-throttled scroll read.
 * prefers-reduced-motion → layers sit at rest, no parallax.
 */

export type RidgeVariant = 'ridge' | 'pines' | 'dunes' | 'skyline';

/** Silhouette path data per variant, far → near. viewBox is 1440×220. */
const SHAPES: Record<RidgeVariant, string[]> = {
  ridge: [
    'M0,190 L120,120 L210,160 L330,70 L450,150 L560,100 L690,165 L820,95 L960,155 L1090,105 L1220,170 L1330,125 L1440,175 L1440,220 L0,220 Z',
    'M0,205 L150,150 L280,185 L400,120 L520,180 L660,135 L780,190 L920,140 L1050,185 L1190,145 L1310,195 L1440,155 L1440,220 L0,220 Z',
    'M0,215 L180,180 L320,205 L470,165 L610,200 L760,175 L900,205 L1040,180 L1200,208 L1340,185 L1440,205 L1440,220 L0,220 Z',
  ],
  pines: [
    'M0,200 L40,150 L60,175 L100,120 L130,170 L175,135 L210,180 L260,140 L300,185 L350,145 L395,190 L450,150 L500,185 L560,140 L610,190 L670,150 L720,188 L790,145 L840,190 L900,155 L960,192 L1030,150 L1080,190 L1150,155 L1200,192 L1270,150 L1330,190 L1390,160 L1440,195 L1440,220 L0,220 Z',
    'M0,212 L60,180 L110,200 L170,170 L230,205 L300,178 L360,208 L430,182 L500,210 L570,185 L640,210 L710,186 L780,212 L850,188 L920,212 L1000,190 L1070,213 L1140,192 L1210,214 L1290,194 L1360,214 L1440,198 L1440,220 L0,220 Z',
  ],
  dunes: [
    'M0,170 C180,120 320,205 520,160 C700,120 860,200 1040,165 C1220,130 1340,190 1440,160 L1440,220 L0,220 Z',
    'M0,195 C200,160 340,215 560,185 C760,158 920,212 1120,188 C1280,168 1380,205 1440,190 L1440,220 L0,220 Z',
    'M0,210 C240,190 400,218 640,203 C860,190 1020,216 1240,205 C1350,199 1400,212 1440,207 L1440,220 L0,220 Z',
  ],
  skyline: [
    // grandstand + tents + a ferris-wheel disc suggested in silhouette
    'M0,200 L90,200 L90,150 L150,150 L150,200 L250,200 L250,120 L300,95 L350,120 L350,200 L470,200 L470,140 L540,140 L540,200 L660,200 L660,110 L700,110 L700,200 L860,200 L860,145 L930,145 L930,200 L1060,200 L1060,125 L1110,125 L1110,200 L1250,200 L1250,155 L1320,155 L1320,200 L1440,200 L1440,220 L0,220 Z',
    'M0,212 L120,212 L120,185 L200,185 L200,212 L340,212 L340,175 L410,175 L410,212 L560,212 L560,190 L640,190 L640,212 L800,212 L800,180 L880,180 L880,212 L1030,212 L1030,192 L1110,192 L1110,212 L1280,212 L1280,182 L1350,182 L1350,212 L1440,212 L1440,220 L0,220 Z',
  ],
};

/** Parallax rate per layer index — far layers barely move, near ones travel. */
const RATES = [10, 26, 48, 70];

export default function RidgeDivider({
  variant = 'ridge',
  from = '#24160f',
  to = '#24160f',
  layerColors,
  label,
}: {
  variant?: RidgeVariant;
  /** Tone of the room ABOVE — the band fades out of this. */
  from?: string;
  /** Tone of the room BELOW — the band settles into this. */
  to?: string;
  /** Silhouette colours far → near. Defaults derive from `to`. */
  layerColors?: string[];
  /** Optional short caption that drifts through the band. */
  label?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layers = Array.from(
      el.querySelectorAll<SVGGElement>('[data-ridge-layer]'),
    );
    let frame = 0;
    const read = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 (band below the fold) → 0 (centred) → 1 (band above the fold)
      const t = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
      const k = Math.max(-1.2, Math.min(1.2, t));
      layers.forEach((layer, i) => {
        layer.style.transform = `translate3d(${k * RATES[i % RATES.length] * -0.55}px, ${k * RATES[i % RATES.length] * 0.35}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const shapes = SHAPES[variant];
  const colors =
    layerColors ??
    shapes.map((_, i) => `rgba(0,0,0,${0.16 + i * 0.14})`);

  return (
    <div
      ref={root}
      className={`ridge ridge--${variant}`}
      style={{ ['--ridge-from' as string]: from, ['--ridge-to' as string]: to }}
      aria-hidden="true"
    >
      <div className="ridge__sky" />
      <svg
        className="ridge__art"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        focusable="false"
      >
        {shapes.map((d, i) => (
          <g key={i} data-ridge-layer style={{ willChange: 'transform' }}>
            <path d={d} fill={colors[i] ?? colors[colors.length - 1]} />
          </g>
        ))}
      </svg>
      {label ? <p className="ridge__label">{label}</p> : null}
    </div>
  );
}
