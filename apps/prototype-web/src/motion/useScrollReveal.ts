import { useEffect } from 'react';
import './reveal.css';

/**
 * useScrollReveal — one controller that gives the whole page its entrance motion.
 * ---------------------------------------------------------------------------
 * WHY A CONTROLLER RATHER THAN PER-COMPONENT ANIMATION
 * Six sections each hand-rolling their own IntersectionObserver produces six
 * slightly different entrances, which is exactly what makes a site feel
 * assembled rather than designed. This walks the page once, classifies each
 * element by role, and lets one stylesheet own the motion language.
 *
 * It also means new sections get the motion for free — nobody has to remember
 * to opt in, and nobody can accidentally invent a seventh easing curve.
 *
 * BIDIRECTIONAL
 * Elements un-reveal when they leave, so scrolling back up replays the arrival
 * instead of walking through a page that has already "spent" itself. The exit
 * is quicker and un-staggered (see reveal.css) so it reads as the page
 * receding, not collapsing.
 *
 * WHAT IT DELIBERATELY SKIPS
 * The fixed island stage, the masthead, the logo marquee and anything already
 * animating. Applying an entrance to an element that is permanently on screen
 * either does nothing or fights whatever else is moving it.
 */

/** Containers whose contents should never be touched. */
const EXCLUDED = ['.fih', '.journey-nav', '.journey__rail', '.logo-marquee', '[data-no-reveal]'];

/**
 * Role classification, most specific first. The order matters: an <a> styled as
 * a button should read as an action, and an <img> inside a card should let the
 * card carry the motion rather than animating twice.
 */
const ROLES: Array<[string, string]> = [
  ['h1, h2, h3, .eyebrow, [class*="__title"], [class*="__eyebrow"]', 'heading'],
  ['img, picture, video, svg[data-reveal-media], [class*="__media"], [class*="__image"]', 'media'],
  ['[class*="card"], [class*="tile"], li, figure', 'card'],
  ['a[class*="btn"], button, [class*="__cta"], [class*="action"]', 'action'],
  ['p, blockquote, dd, [class*="__copy"], [class*="__lede"]', 'text'],
];

export function useScrollReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const excluded = EXCLUDED.join(',');
    const tagged: Element[] = [];

    /** Assign a role + stagger index to everything worth animating. */
    const tag = () => {
      for (const [selector, role] of ROLES) {
        document.querySelectorAll(selector).forEach((el) => {
          if (el.hasAttribute('data-reveal')) return;      // first role wins
          if (el.closest(excluded)) return;
          // Nested matches animate twice and read as a stutter — let the
          // outermost candidate own the motion for its subtree.
          if (el.parentElement?.closest('[data-reveal]')) return;
          el.setAttribute('data-reveal', role);
          tagged.push(el);
        });
      }

      // Stagger is per-parent, so a row of four cards cascades but two
      // unrelated paragraphs in different sections do not wait on each other.
      const seen = new Map<Element, number>();
      for (const el of tagged) {
        const parent = el.parentElement;
        if (!parent) continue;
        const i = seen.get(parent) ?? 0;
        seen.set(parent, i + 1);
        // Cap the cascade: past ~6 items the last one arrives late enough to
        // feel broken rather than choreographed.
        (el as HTMLElement).style.setProperty('--reveal-i', String(Math.min(i, 6)));
      }
    };

    // Arm the hidden state ONLY now — see the note at the top of reveal.css.
    // Until this class exists nothing is hidden, so a failure to reach this
    // line leaves a fully visible (if unanimated) page rather than a blank one.
    const root = document.documentElement;
    root.classList.add('reveal-active');

    let everFired = false;

    const io = new IntersectionObserver(
      (entries) => {
        everFired = true;
        for (const entry of entries) {
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        }
      },
      {
        // Fire a little before the element reaches the edge, and require a
        // sliver of it to be on screen, so things are already arriving as they
        // appear rather than popping once fully visible.
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.06,
      },
    );

    tag();
    tagged.forEach((el) => io.observe(el));

    // Sections mount lazily (the 3D hero is code-split, rooms hydrate as they
    // scroll in), so re-scan when the DOM settles rather than only once.
    const mo = new MutationObserver(() => {
      const before = tagged.length;
      tag();
      for (let i = before; i < tagged.length; i++) io.observe(tagged[i]);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    /**
     * Failsafe. Browsers suspend IntersectionObserver in hidden and
     * prerendering tabs, and a bfcache restore can resume a page mid-flight.
     * If nothing has been observed by the time this fires, stand down entirely
     * and show the page — an un-animated site is a minor disappointment, an
     * invisible one is a broken site.
     */
    const failsafe = window.setTimeout(() => {
      if (everFired) return;
      root.classList.remove('reveal-active');
    }, 2000);

    // Coming back from a hidden tab, re-arm so the page animates from a known
    // state rather than whatever it was frozen mid-transition into.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!root.classList.contains('reveal-active')) root.classList.add('reveal-active');
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(failsafe);
      document.removeEventListener('visibilitychange', onVisible);
      io.disconnect();
      mo.disconnect();
      root.classList.remove('reveal-active');
      for (const el of tagged) {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-revealed');
      }
    };
  }, [enabled]);
}
