import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Gem, Heart, Sprout, Sun, Timer, Wheat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './health.css';

type Benefit = {
  id: string;
  Icon: LucideIcon;
  title: string;
  body: string;
};

type Stat = {
  id: string;
  value: string;
  label: string;
};

/**
 * Lifestyle-framed, general nutrition context only.
 * No medical or disease claims, no numbers we can't stand behind.
 */
const BENEFITS: Benefit[] = [
  {
    id: 'fats',
    Icon: Heart,
    title: 'Naturally good fats',
    body: 'Nuts are naturally rich in unsaturated fats — the kind that make a small handful feel genuinely worth sitting down for.',
  },
  {
    id: 'protein',
    Icon: Sprout,
    title: 'Plant protein, no lecture',
    body: 'Almonds, cashews, peanuts and pistachios are all a good source of plant-based protein. It arrives already delicious.',
  },
  {
    id: 'fiber',
    Icon: Wheat,
    title: 'Fiber comes standard',
    body: 'Eaten whole the way we roast them, nuts bring dietary fiber along with everything else. Nothing has to be added back in.',
  },
  {
    id: 'vitamin-e',
    Icon: Sun,
    title: 'Almonds and vitamin E',
    body: 'Almonds are a well-known source of vitamin E, which is one small reason they have never really gone out of style.',
  },
  {
    id: 'minerals',
    Icon: Gem,
    title: 'Minerals like magnesium',
    body: 'Nuts and seeds naturally contain minerals such as magnesium, zinc and copper — quietly, without any marketing help.',
  },
  {
    id: 'satisfying',
    Icon: Timer,
    title: 'Actually satisfying',
    body: 'Fat, protein and fiber together make nuts the rare snack that does not vanish on you five minutes after the bowl does.',
  },
];

const STATS: Stat[] = [
  { id: 'years', value: '40', label: 'years roasting, since 1986' },
  { id: 'shows', value: '225+', label: 'shows and events every year' },
  { id: 'repeat', value: '96%', label: 'of our customers come back' },
];

/** Stagger step, in ms, between siblings in a revealing group. */
const STAGGER = 90;

function delay(index: number): CSSProperties {
  return { '--hr-delay': `${index * STAGGER}ms` } as CSSProperties;
}

export default function HealthSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Staggered reveal — one observer, per-group, unobserved once played.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-hr-group]'));
    if (groups.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      groups.forEach((group) => group.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  // Soft parallax drift on the two texture layers. Transform only, rAF-throttled.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const raw = (viewport - rect.top) / (viewport + rect.height);
      const progress = Math.min(1, Math.max(0, raw)) - 0.5;
      root.style.setProperty('--health-drift', `${(progress * 76).toFixed(2)}px`);
      root.style.setProperty('--health-drift-slow', `${(progress * -38).toFixed(2)}px`);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="health" className="health" aria-labelledby="health-title">
      <div className="health__glow" aria-hidden="true" />
      <div className="health__leaves" aria-hidden="true" />
      <div className="health__vignette" aria-hidden="true" />

      <div className="health__inner">
        <header className="health__head" data-hr-group>
          <p className="health__eyebrow" data-hr style={delay(0)}>
            Nutrition, naturally
          </p>
          <h2 className="health__title" id="health-title" data-hr style={delay(1)}>
            Good for you, actually
          </h2>
          <p className="health__lede" data-hr style={delay(2)}>
            We are not going to stand here and tell you butter toffee peanuts are a health food.
            But the nut underneath forty years of Carney family caramel has been quietly excellent
            the whole time — and most of what leaves our roaster never goes near a candy kettle.
          </p>
          <p className="health__lede" data-hr style={delay(3)}>
            <strong>Roasted fresh to order, never pre-roasted.</strong> Which is a nicer way of
            saying nothing sits around losing its personality in a warehouse.
          </p>
        </header>

        <ul className="health__grid" data-hr-group>
          {BENEFITS.map((benefit, index) => {
            const { Icon } = benefit;
            return (
              <li
                key={benefit.id}
                className="glass glass-card health-card"
                data-hr
                style={delay(index)}
              >
                <span className="health-card__badge">
                  <span className="health-card__pulse" style={delay(index)} aria-hidden="true" />
                  <Icon className="health-card__icon" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="health-card__title">{benefit.title}</h3>
                <p className="health-card__body">{benefit.body}</p>
              </li>
            );
          })}
        </ul>

        <ul className="glass health__stats" data-hr-group aria-label="Simply Nuts &amp; More by the numbers">
          {STATS.map((stat, index) => (
            <li key={stat.id} className="health-stat" data-hr style={delay(index)}>
              <span className="health-stat__value">{stat.value}</span>
              <span className="health-stat__label">{stat.label}</span>
            </li>
          ))}
        </ul>

        <p className="health__note" data-hr-group data-hr>
          General nutrition context only — not medical or dietary advice, and not a claim about any
          specific product. Everything we make is nuts, chocolate, or both, so check the product page
          for full ingredient and allergen details before you gift it.
        </p>
      </div>
    </section>
  );
}
