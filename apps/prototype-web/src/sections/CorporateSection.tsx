import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import './corporate.css';

/**
 * CorporateSection — "Your logo, laser-engraved"
 *
 * Dark walnut / espresso room with a copper-gold rim glow. Sells corporate
 * gifting on RETENTION (the buyer's job is keeping clients), shows the real
 * engraved product, explains the three-step program, and hands off to
 * /contact (primary) and /corporate (secondary).
 *
 * Motion: one IntersectionObserver adds `.is-visible` to every
 * `[data-corp-reveal]` node; per-child stagger is carried by the `--corp-i`
 * custom property, so all timing lives in CSS and honors reduced-motion.
 */

/** Inline style that carries the stagger index into CSS. */
type StaggerStyle = CSSProperties & { '--corp-i': number };

function stagger(index: number): StaggerStyle {
  return { '--corp-i': index };
}

type Shot = {
  /** grid placement modifier */
  slot: 'a' | 'b' | 'c' | 'd';
  src: string;
  alt: string;
  name: string;
  note: string;
};

/**
 * Only files that exist in public/brand/. The two multi-megabyte container
 * photos are deliberately left out — this room sits below the fold and the
 * lighter four tell the same story without a 15 MB payload.
 */
const SHOTS: Shot[] = [
  {
    slot: 'a',
    src: '/brand/corp-wood-box-4lb.jpg',
    alt: 'Four-pound hardwood gift box with a company logo laser-engraved into the lid, filled with roasted nuts.',
    name: 'The 4 lb hardwood box',
    note: 'Engraved lid, hinged, refillable. The one that stays on the desk.',
  },
  {
    slot: 'b',
    src: '/brand/corp-tin-pinecone.jpg',
    alt: 'Round gift tin with a pinecone motif etched into the lid.',
    name: 'Etched gift tins',
    note: 'Your mark, burned deep — not a sticker that peels by February.',
  },
  {
    slot: 'c',
    src: '/brand/corp-tins-v3.jpg',
    alt: 'A set of three engraved gift tins arranged together, each with a different lid design.',
    name: 'Tins, three ways',
    note: 'Mix sizes across one client list. Same logo, different budgets.',
  },
  {
    slot: 'd',
    src: '/brand/wood-box.jpg',
    alt: 'Close view of a solid wood gift box showing the depth and grain of the laser engraving.',
    name: 'Solid wood, burned deep',
    note: 'Walnut and bamboo, cut and engraved in Chanhassen, filled the week it ships.',
  },
];

type Step = {
  num: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Engrave your logo',
    body: 'Send your mark however you have it — vector, PNG, a photo of a business card. We laser it into hardwood, bamboo, or tin. No printing, no adhesive, nothing that wears off.',
  },
  {
    num: '02',
    title: 'Fill it with fresh-roasted',
    body: 'Choose the inside: Secret Peanuts, jumbo cashews, dark chocolate almonds, house trail mixes. Everything is roasted to order for your run — never pulled off a pre-roasted shelf.',
  },
  {
    num: '03',
    title: 'Ship direct to every client',
    body: 'Hand us the address list and we label, pack, and send each box to each doorstep. You approve one proof and then never touch a shipping label.',
  },
];

const STATS = [
  { value: '40 yrs', label: 'Family-run since 1986' },
  { value: '~96%', label: 'Of customers order again' },
  { value: '225+', label: 'Shows a year, still handmade' },
];

export default function CorporateSection() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-corp-reveal]'));
    if (targets.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="corporate"
      className="corp-section py-24 md:py-32"
      aria-labelledby="corp-heading"
    >
      <div className="corp-inner max-w-6xl mx-auto px-4">
        {/* ---- editorial header ---- */}
        <header>
          <p className="corp-eyebrow" data-corp-reveal style={stagger(0)}>
            Corporate gifting
          </p>

          <h2 id="corp-heading" className="corp-title" data-corp-reveal style={stagger(1)}>
            Your logo, <span className="corp-title__burn">laser-engraved</span>.
          </h2>

          <p className="corp-lede" data-corp-reveal style={stagger(2)}>
            Nobody renews a contract over a fruit basket. Your job isn't December — it's{' '}
            <strong>keeping the client you already fought to win</strong>. So we burn your mark into
            a wooden box your client actually keeps: on the desk, on the shelf, refilled next year.
            The nuts disappear in a week. The box stays all four quarters.
          </p>

          <ul className="corp-stats" data-corp-reveal style={stagger(3)}>
            {STATS.map((stat) => (
              <li key={stat.label}>
                <span className="corp-stat__value">{stat.value}</span>
                <span className="corp-stat__label">{stat.label}</span>
              </li>
            ))}
          </ul>
        </header>

        {/* ---- product showcase ---- */}
        <h3 className="sr-only">What we engrave</h3>
        <div className="corp-gallery mt-20 md:mt-28">
          {SHOTS.map((shot, i) => (
            <figure
              key={shot.src}
              className={`corp-shot corp-shot--${shot.slot}`}
              data-corp-reveal
              style={stagger(i)}
            >
              <img
                className="corp-shot__img"
                src={shot.src}
                alt={shot.alt}
                loading="lazy"
                decoding="async"
              />
              <span className="corp-shot__sweep" aria-hidden="true" />
              <figcaption className="corp-shot__cap">
                <span className="corp-shot__name">{shot.name}</span>
                <span className="corp-shot__note">{shot.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* ---- how it works ---- */}
        <div className="mt-24 md:mt-32">
          <h3 className="corp-steps-head" data-corp-reveal style={stagger(0)}>
            Three steps, then it runs itself.
          </h3>

          <div className="corp-steps-wrap">
            <span className="corp-steps__rail" aria-hidden="true" data-corp-reveal />
            <ol className="corp-steps">
              {STEPS.map((step, i) => (
                <li className="corp-step" key={step.num} data-corp-reveal style={stagger(i + 1)}>
                  <span className="corp-step__num" aria-hidden="true">
                    {step.num}
                  </span>
                  <h4 className="corp-step__title">{step.title}</h4>
                  <p className="corp-step__body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ---- closing CTA ---- */}
        <div className="corp-cta glass mt-24 md:mt-32" data-corp-reveal style={stagger(0)}>
          <p className="corp-cta__kicker">Ordering for a client list?</p>
          <h3 className="corp-cta__title">Let's build your box.</h3>
          <p className="corp-cta__body">
            Tell us roughly how many, roughly when, and what your logo looks like. We'll come back
            with a proof and a real number — usually the same day, always from a person named
            Carney.
          </p>

          <div className="corp-cta__actions">
            <Link to="/contact" className="glass glass-pill glass-pill--solid corp-cta__primary">
              Start a corporate order
            </Link>
            <Link to="/corporate" className="glass glass-pill corp-cta__secondary">
              See the gifting program
            </Link>
          </div>

          <p className="corp-cta__note">
            Roasted to order in Chanhassen, Minnesota. No minimums that make you round up.
          </p>
        </div>
      </div>
    </section>
  );
}
