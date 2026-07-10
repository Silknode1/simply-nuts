import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SHOP_COLLECTIONS } from '../config';
import './FloatingIslandHero.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * FloatingIslandHeroCanvas (2D fallback)
 * ------------------------------------------------------------------
 * Scroll-scrubbed "floating nut island" hero. Each tree is a flat plane
 * that scrubs a preloaded WebP frame-sequence (young -> mature) as the
 * user scrolls, over its own staggered progress window. The whole island
 * gently floats; shoppable trees reveal a hotspot when they finish ripening.
 *
 * Assets live in /public/hero/ (island webp + seq/<id>/f_NN.webp), produced
 * from the Kling clips. Everything is data-driven by TREES below — nudge
 * left/top/w/h to reposition a plane, or `win` to change ripening order.
 *
 * No three.js required: Canvas image-sequence scrub + gsap ScrollTrigger.
 */

const NUTS = SHOP_COLLECTIONS.nuts;

type Tree = {
  id: string;
  frames: number;
  left: number; top: number; w: number; h: number; // % of the 16:9 stage
  win: [number, number];                            // maturation window in scroll progress 0..1
  shop?: boolean; label?: string; href?: string;
};

const TREES: Tree[] = [
  { id: 'almond',    frames: 61, left: 2.3,  top: 0.9,  w: 21.2, h: 50.3, win: [0.00, 0.34], shop: true,  label: 'Shop Almonds',    href: NUTS },
  { id: 'peanut',    frames: 61, left: 4.8,  top: 39.9, w: 11.4, h: 26.9, win: [0.05, 0.40], shop: true,  label: 'Shop Peanuts',    href: NUTS },
  { id: 'cashew',    frames: 61, left: 29.8, top: 0.7,  w: 21.0, h: 49.9, win: [0.12, 0.50], shop: true,  label: 'Shop Cashews',    href: NUTS },
  { id: 'pistachio', frames: 61, left: 42.8, top: 8.7,  w: 18.3, h: 43.4, win: [0.22, 0.60], shop: true,  label: 'Shop Pistachios', href: NUTS },
  { id: 'walnut',    frames: 61, left: 54.2, top: 1.1,  w: 21.0, h: 49.9, win: [0.34, 0.72], shop: true,  label: 'Shop Walnuts',    href: NUTS },
  { id: 'pine',      frames: 61, left: 63.3, top: 3.9,  w: 16.5, h: 39.1, win: [0.46, 0.82], shop: false },
  { id: 'pecan',     frames: 61, left: 71.5, top: 3.5,  w: 20.5, h: 48.6, win: [0.58, 0.95], shop: true,  label: 'Shop Pecans',     href: NUTS },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const BASE = (import.meta as any).env?.BASE_URL ?? '/';
const asset = (p: string) => `${BASE}hero/${p}`.replace(/\/{2,}/g, '/');

export default function FloatingIslandHeroCanvas() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvases = TREES.map((t) => wrap.querySelector<HTMLCanvasElement>(`canvas[data-id="${t.id}"]`)!);
    const hotspots = TREES.map((t) => (t.shop ? wrap.querySelector<HTMLElement>(`a[data-id="${t.id}"]`) : null));
    const ctxs = canvases.map((c) => c.getContext('2d')!);
    const imgs: (HTMLImageElement | undefined)[][] = TREES.map((t) => new Array(t.frames));
    const cur: number[] = TREES.map(() => -1);

    // preload all frames
    TREES.forEach((t, ti) => {
      for (let i = 0; i < t.frames; i++) {
        const n = String(i + 1).padStart(2, '0');
        const img = new Image();
        img.onload = () => {
          imgs[ti][i] = img;
          const c = canvases[ti];
          if (!c.width && img.naturalWidth) { c.width = img.naturalWidth; c.height = img.naturalHeight; }
        };
        img.src = asset(`seq/${t.id}/f_${n}.webp`);
      }
    });

    const draw = (force = false) => {
      const p = progress.current;
      TREES.forEach((t, ti) => {
        const [a, b] = t.win;
        const local = clamp((p - a) / (b - a), 0, 1);
        const f = clamp(Math.round(local * (t.frames - 1)), 0, t.frames - 1);
        const c = canvases[ti];
        if ((f !== cur[ti] || force) && imgs[ti][f] && c.width) {
          ctxs[ti].clearRect(0, 0, c.width, c.height);
          ctxs[ti].drawImage(imgs[ti][f]!, 0, 0, c.width, c.height);
          cur[ti] = f;
        }
        const hs = hotspots[ti];
        if (hs) hs.classList.toggle('on', local >= 0.88);
      });
    };

    // scroll scrub via gsap ScrollTrigger (pins the stage for ~4 screens)
    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top top',
      end: '+=360%',
      pin: wrap.parentElement,
      scrub: 0.6,
      onUpdate: (self) => { progress.current = self.progress; draw(false); },
    });

    // gentle float + subtle scroll drift/scale
    let raf = 0;
    const tick = (ts: number) => {
      const floatY = Math.sin(ts / 1400) * 0.9;
      const drift = lerp(-1.5, 1.5, progress.current);
      const scale = lerp(1.02, 1.0, progress.current);
      wrap.style.transform = `translateY(${floatY + drift}%) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    draw(true);

    return () => { cancelAnimationFrame(raf); st.kill(); };
  }, []);

  return (
    <section ref={sectionRef} className="fih">
      <div className="fih__stage">
        <div className="fih__titles">
          <h1>Premium Quality.<span>Hand sourced from across the Globe.</span></h1>
          <p>Scroll to watch the harvest ripen.</p>
        </div>
        <div ref={wrapRef} className="fih__wrap">
          <img className="fih__base" src={asset('hero-island.webp')} alt="Floating nut island" draggable={false} />
          {TREES.map((t) => (
            <div key={t.id} className="fih__tree" style={{ left: `${t.left}%`, top: `${t.top}%`, width: `${t.w}%`, height: `${t.h}%` }}>
              <canvas data-id={t.id} />
            </div>
          ))}
          {TREES.filter((t) => t.shop).map((t) => (
            <a
              key={t.id}
              data-id={t.id}
              className="fih__hotspot"
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ left: `${t.left + t.w * 0.52}%`, top: `${t.top + t.h * 0.3}%` }}
            >
              <span className="fih__dot" />
              {t.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
