import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SHOP_URL } from '../config';
import './journey-nav.css';

/**
 * JourneyNav — the floating warm-glass nav for the immersive journey.
 *
 * The wordmark is the brand's loudest asset, so it opens LARGE — a proper
 * masthead over the orchard — and contracts to a still-clearly-legible size as
 * you scroll, instead of living permanently small. Driven by one rAF-throttled
 * scroll read writing a single CSS custom property, so it costs nothing.
 */
export default function JourneyNav() {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const read = () => {
      frame = 0;
      // 0 at the very top (masthead) → 1 once you're a screen in (compact)
      const k = reduced
        ? 1
        : Math.min(1, window.scrollY / Math.max(window.innerHeight * 0.55, 1));
      el.style.setProperty('--nav-k', String(k));
      el.classList.toggle('journey-nav--compact', k > 0.55);
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

  return (
    <header ref={nav} className="journey-nav">
      <nav className="journey-nav__inner glass" aria-label="Primary">
        <Link to="/" className="journey-nav__brand" aria-label="Simply Nuts & More — home">
          <img
            src="/brand/logo-wordmark.webp"
            alt="Simply Nuts &amp; More"
            className="journey-nav__logo"
            draggable={false}
          />
        </Link>

        <div className="journey-nav__links">
          <Link to="/corporate" className="glass-pill journey-nav__link">
            Corporate Gifting
          </Link>
          <Link to="/about" className="glass-pill journey-nav__link journey-nav__link--wide">
            About
          </Link>
          <Link to="/contact" className="glass-pill journey-nav__link journey-nav__link--wide">
            Contact
          </Link>
          <a href={SHOP_URL} className="glass-pill glass-pill--solid journey-nav__shop">
            Shop Now
          </a>
        </div>
      </nav>
    </header>
  );
}
