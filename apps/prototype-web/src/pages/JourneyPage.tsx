import { Suspense, lazy, useEffect, useRef } from 'react';
import ProductsSection from '../sections/ProductsSection';
import HealthSection from '../sections/HealthSection';
import CorporateSection from '../sections/CorporateSection';
import ClientsSection from '../sections/ClientsSection';
import DesignToolSection from '../sections/DesignToolSection';
import ScheduleSection from '../sections/ScheduleSection';
import RidgeDivider from '../components/RidgeDivider';
import './journey.css';

// three.js stays out of the shared bundle — the orchard act is the only 3D on the page
const FloatingIslandHero3D = lazy(() => import('../components/FloatingIslandHero3D'));

/**
 * JourneyPage — the unified front door.
 * ------------------------------------------------------------------
 * One continuous scroll that opens on the pinned 3D orchard (the island
 * ripening, parking left, handing off to product cards) and then walks
 * through a sequence of tonally distinct "rooms":
 *
 *   orchard (neutral/dark)  →  harvest (light cream)  →  health (deep forest)
 *   →  corporate (dark walnut)  →  clients (neutral bridge)
 *   →  design studio (near-black)  →  where's the nut guy (dusk blue)
 *
 * Each section owns its own background so the page reads as a series of
 * rooms rather than one long scroll. The seams between them are softened
 * by a shared gradient bleed (see journey.css) so tone changes feel like
 * lighting shifts, not hard cuts.
 *
 * Motion budget (docs/motion-system-v1.md): the only 3D is the hero act.
 * Everything below is IntersectionObserver + CSS transform/opacity.
 */

/** Thin gold scroll-progress rail — quiet wayfinding without a "skip" button. */
function JourneyRail() {
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (fill.current) fill.current.style.transform = `scaleX(${p})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="journey__rail" aria-hidden="true">
      <div ref={fill} className="journey__rail-fill" />
    </div>
  );
}

export default function JourneyPage() {
  return (
    <div className="journey">
      <JourneyRail />

      {/* Act I — the orchard. Pinned 3D scroll story, ends parked left with products. */}
      <Suspense fallback={<div className="journey__hero-fallback" aria-hidden="true" />}>
        <FloatingIslandHero3D />
      </Suspense>

      {/* The rooms. Order is deliberate: appetite → wellbeing → the pitch →
          proof → the tool → come find us. Tone alternates light/dark so no two
          adjacent rooms feel the same, and every seam is a parallaxing
          landscape band so the tone change reads as *travelling* between
          places rather than cutting between panels. Ridge `from`/`to` match
          each room's real edge colour, so the seams are invisible. */}
      <ProductsSection />

      <RidgeDivider variant="pines" from="#fdf8f0" to="#0d240d" label="Into the grove" />
      <HealthSection />

      <RidgeDivider variant="ridge" from="#0b1f0b" to="#2a1809" label="To the workshop" />
      <CorporateSection />

      <RidgeDivider variant="dunes" from="#241407" to="#1c1208" />
      <ClientsSection />

      <RidgeDivider variant="ridge" from="#22150c" to="#0c0704" label="The design floor" />
      <DesignToolSection />

      <RidgeDivider variant="skyline" from="#090603" to="#070f21" label="Come find us" />
      <ScheduleSection />
    </div>
  );
}
