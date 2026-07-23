import {useState} from 'react';
import {motion} from 'framer-motion';
import LaserHeroAnimation from './LaserHeroAnimation';

/*
  Timing strategy:
  - Animation = 3.5s total (laser scan + overlay fade happen simultaneously)
  - 60% mark = 2.1s — first page element begins appearing
  - 60–100% (2.1–3.5s) — elements appear in priority order
  - After animation: logo text pulses amber ~0.8s

  Priority order: brand elements → copy → CTAs
*/

const FADE_SEC = 5.3; // laser 4.9s + 0.4s extra fade
const FIRST_APPEAR = FADE_SEC * 0.6; // 3.18s

// Staggered delays — priority-based, spread between 60%–100% of animation
const DELAYS = {
  logo:     FIRST_APPEAR - 0.8,  // 1.3s — starts fading early so it's solid by 60%
  eyebrow:  FIRST_APPEAR,         // 2.1s — "Premium Custom Gifting" (brand priority)
  subtext:  FIRST_APPEAR + 0.15,  // 2.25s — has "laser-engraved", "Chanhassen"
  headline: FIRST_APPEAR + 0.35,  // 2.45s
  trust:    FIRST_APPEAR + 0.6,   // 2.7s
  ctas:     FIRST_APPEAR + 0.9,   // 3.0s — CTAs appear last
};

export default function HeroSection() {
  const [animDone, setAnimDone] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      {/* Laser overlay — fades simultaneously with scan */}
      {!animDone && !prefersReducedMotion && (
        <LaserHeroAnimation onComplete={() => setAnimDone(true)} />
      )}

      {/* Page content — always rendered, fades in behind overlay */}
      <section className="hero-centered">

        {/* Eyebrow — brand priority */}
        <motion.p
          className="hero-eyebrow"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5, delay: DELAYS.eyebrow}}
        >
          Premium Custom Gifting — Since 1986
        </motion.p>

        {/* Logo — appears earliest so it's solid by 60% mark */}
        <motion.div
          className={`hero-logo-wrap${animDone ? ' glow-amber' : ''}`}
          initial={{opacity: 0, scale: 0.96}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 1.0, delay: DELAYS.logo}}
        >
          <img
            src="/brand/logo-main.png"
            alt="Simply Nuts and More — Chippy the chipmunk logo"
            className="hero-logo-img"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="hero-headline"
          initial={{opacity: 0, y: 14}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.55, delay: DELAYS.headline}}
        >
          40 Years of Premium Gifting. Now With Your Name On It.
        </motion.h1>

        {/* Subtext — priority words: "laser-engraved", "Chanhassen, Minnesota" */}
        <motion.p
          className="hero-subtext"
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: DELAYS.subtext}}
        >
          From hand-selected nuts to laser-engraved gifts — crafted with care in
          Chanhassen, Minnesota.
        </motion.p>

        {/* Trust badges */}
        <motion.div
          className="hero-trust-row"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5, delay: DELAYS.trust}}
        >
          <span className="trust-badge">
            <span className="star">&#9733;</span> 4.9/5 Corporate Satisfaction
          </span>
          <span className="trust-badge">500+ Companies Gifted</span>
        </motion.div>

        {/* CTAs — last to appear */}
        <motion.div
          className="hero-cta-row"
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: DELAYS.ctas}}
        >
          <button className="btn btn-primary" type="button" aria-label="Start designing your custom gift">Design Your Gift</button>
          <button className="btn btn-secondary" type="button" aria-label="Browse our product catalog">Shop Products</button>
        </motion.div>
      </section>
    </>
  );
}
