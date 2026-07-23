import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {SHOP_URL, SHOP_COLLECTIONS} from '../config';

type ContainerKey = 'wood' | 'bamboo' | 'tin';

type ContainerPreset = {
  alt: string;
  label: string;
};

const containers: Record<ContainerKey, ContainerPreset> = {
  wood: {label: 'Wooden Box', alt: 'Cartoon-styled wooden gift box top'},
  bamboo: {label: 'Bamboo Container', alt: 'Cartoon-styled bamboo container top'},
  tin: {label: 'Gift Tin', alt: 'Cartoon-styled gift tin top'}
};

const bestSellers = [
  {
    title: 'Secret Peanuts (Butter Toffee)',
    blurb: 'Our signature. Crunchy, buttery, impossible to put down.',
    image: '/brand/secret-peanuts.jpg',
    href: SHOP_COLLECTIONS.nuts
  },
  {
    title: 'Jumbo Cashews',
    blurb: 'Big, buttery, roasted to order — never stale.',
    image: '/brand/cashews.jpg',
    href: SHOP_COLLECTIONS.nuts
  },
  {
    title: 'Cranberry Trail Mix',
    blurb: 'Sweet-tart and endlessly snackable.',
    image: '/brand/cranberry-trail-mix.jpg',
    href: SHOP_COLLECTIONS.trailMixes
  },
  {
    title: 'Pecan Pralines',
    blurb: 'A little Southern indulgence, made up North.',
    image: '/brand/pecan-pralines.jpg',
    href: SHOP_COLLECTIONS.nuts
  },
  {
    title: 'Dark Chocolate Almonds',
    blurb: 'A timeless classic in every handful.',
    image: '/brand/dark-chocolate-almonds.jpg',
    href: SHOP_COLLECTIONS.chocolates
  },
  {
    title: 'Ultra Berry Mix',
    blurb: 'Berries, nuts, and a touch of chocolate.',
    image: '/brand/ultra-berry.jpg',
    href: SHOP_COLLECTIONS.trailMixes
  }
];

const collections = [
  {
    label: 'Nuts',
    blurb: 'Roasted in small batches — cashews, almonds, pistachios & more.',
    image: '/brand/roasted-almonds.jpg',
    href: SHOP_COLLECTIONS.nuts
  },
  {
    label: 'Trail Mixes',
    blurb: 'Hand-mixed blends for the trail, the desk, or the couch.',
    image: '/brand/imperial-mix.jpg',
    href: SHOP_COLLECTIONS.trailMixes
  },
  {
    label: 'Chocolates',
    blurb: 'Chocolate-covered everything, from almonds to malt balls.',
    image: '/brand/chocolate-cashews.jpg',
    href: SHOP_COLLECTIONS.chocolates
  }
];

const reviews = [
  {
    quote:
      "We've been buying their Secret Peanuts at the State Fair for years. Now I order by the pound all winter long.",
    name: 'Karen M.',
    detail: 'Eden Prairie, MN'
  },
  {
    quote:
      'The freshest nuts I have ever had shipped. You can taste that they were just roasted.',
    name: 'Dev P.',
    detail: 'Repeat customer'
  },
  {
    quote:
      'Sent the engraved gift boxes to our whole sales team. Everyone asked where they came from.',
    name: 'Lindsay R.',
    detail: 'Office Manager'
  }
];

function useRevealObserver() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {threshold: 0.16}
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HomePage() {
  useRevealObserver();

  const navigate = useNavigate();
  const [container, setContainer] = useState<ContainerKey>('wood');
  const [includeChippy, setIncludeChippy] = useState(true);
  const [engravingText, setEngravingText] = useState('SIMPLY NUTS & MORE');
  const [laserProgress, setLaserProgress] = useState(0);
  const [isBurning, setIsBurning] = useState(false);
  const [hasEngraved, setHasEngraved] = useState(false);

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const animationFrameRef = useRef<number | undefined>(undefined);
  const burnStartRef = useRef(0);

  const rows = 24;
  const progressByRows = laserProgress * rows;
  const rowIndex = clamp(Math.floor(progressByRows), 0, rows - 1);
  const rowT = clamp(progressByRows - rowIndex, 0, 1);
  const isForward = rowIndex % 2 === 0;
  const xInRow = isForward ? rowT : 1 - rowT;
  const laserX = 12 + xInRow * 76;
  const laserY = 18 + (rowIndex / (rows - 1)) * 62;

  const displayText = includeChippy ? `CHIPPY • ${engravingText}` : engravingText;

  const laserVars = {
    ['--laser-x' as any]: `${laserX}%`,
    ['--laser-y' as any]: `${laserY}%`,
    ['--engrave-progress' as any]: `${laserProgress}`
  } as React.CSSProperties;

  const replayLaser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setHasEngraved(false);
    setIsBurning(true);
    setLaserProgress(0);
    burnStartRef.current = performance.now();

    const duration = 3600;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - burnStartRef.current;
      const normalized = clamp(elapsed / duration, 0, 1);
      setLaserProgress(normalized);

      if (normalized < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        setIsBurning(false);
        setHasEngraved(true);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    replayLaser();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => replayLaser(), 180);
    return () => clearTimeout(timeout);
  }, [container, includeChippy]);

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar" aria-label="Business contact">
        <span>Chanhassen, Minnesota</span>
        <span>1-888-449-6887</span>
        <span>Family-run since 1986</span>
      </header>

      <main>
        {/* ── Hero (laser engraving centerpiece) ── */}
        <section className="hero-shell" data-reveal>
          <div className="hero-copy-column">
            <img className="logo-lockup" src="/brand/logo-main.png" alt="Simply Nuts and More" />
            <p className="eyebrow">Family-crafted in Minnesota since 1986</p>
            <h1>Freshly roasted nuts, mixes &amp; chocolates — the good stuff, by the pound.</h1>
            <p>
              Small-batch roasted and hand-mixed in Chanhassen, Minnesota, then shipped fresh to your door.
              From buttery Jumbo Cashews to our famous Secret Peanuts, every bag is made the way we'd want
              it ourselves. (And come the holidays, we'll laser-engrave gifts for your whole client list.)
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href={SHOP_URL} aria-label="Shop our nuts, trail mixes and chocolates">
                Shop Our Treats
              </a>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate('/contact')}
                aria-label="Learn about corporate gifting"
              >
                Corporate Gifting
              </button>
            </div>
          </div>

          <div
            className={`engrave-stage ${container} ${isBurning ? 'is-burning' : ''} ${
              hasEngraved ? 'is-engraved' : ''
            }`}
            style={laserVars}
            aria-label={containers[container].alt}
          >
            <div className={`toon-box-surface ${container}`} />
            <div className="engrave-vignette" />

            <div className="engrave-center-wrap">
              <svg className="engrave-logo" viewBox="0 0 920 300" role="img" aria-label="Laser engraved logo">
                <defs>
                  <linearGradient id="engraveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f1cf9f" />
                    <stop offset="40%" stopColor="#8f5f44" />
                    <stop offset="72%" stopColor="#efc18f" />
                    <stop offset="100%" stopColor="#6f4935" />
                  </linearGradient>
                </defs>

                <text x="80" y="130" className="logo-main logo-base">
                  SIMPLY NUTS
                </text>
                <text x="80" y="220" className="logo-sub logo-base">
                  {displayText.slice(0, 30)}
                </text>

                <g className={`logo-burn ${isBurning ? 'is-burning' : ''} ${hasEngraved ? 'is-engraved' : ''}`}>
                  <text x="80" y="130" className="logo-main" fill="url(#engraveGradient)">
                    SIMPLY NUTS
                  </text>
                  <text x="80" y="220" className="logo-sub" fill="url(#engraveGradient)">
                    {displayText.slice(0, 30)}
                  </text>
                </g>
              </svg>
            </div>

            <div className={`laser-raster ${isBurning ? 'is-burning' : ''}`} aria-hidden="true" />
            <div className={`laser-beam ${isBurning ? 'is-burning' : ''}`} aria-hidden="true" />
            <div className={`laser-head ${isBurning ? 'is-burning' : ''}`} aria-hidden="true">
              <span className="spark s1" />
              <span className="spark s2" />
              <span className="spark s3" />
              <span className="spark s4" />
            </div>
            <div className={`laser-smoke ${isBurning ? 'is-burning' : ''}`} aria-hidden="true" />
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section className="trust-strip" data-reveal aria-label="Why shop with us">
          <div><strong>40 Years</strong><span>Family-run since 1986</span></div>
          <div><strong>State Fair Famous</strong><span>A Minnesota tradition</span></div>
          <div><strong>Roasted to Order</strong><span>Small-batch, never stale</span></div>
          <div><strong>Shipped Fresh</strong><span>From Chanhassen, MN</span></div>
        </section>

        {/* ── Best Sellers ── */}
        <section id="best-sellers" className="section-block" data-reveal aria-labelledby="best-sellers-heading">
          <div className="section-head">
            <p className="eyebrow">Crowd favorites</p>
            <h2 id="best-sellers-heading">Best-sellers, year after year</h2>
            <p className="section-sub">
              The treats our customers keep coming back for — roasted, mixed, and dipped in small batches,
              then shipped fresh by the pound.
            </p>
          </div>
          <div className="featured-grid">
            {bestSellers.map((item) => (
              <a key={item.title} className="featured-card" href={item.href}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="featured-card-body">
                  <strong>{item.title}</strong>
                  <span>{item.blurb}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="section-cta">
            <a className="btn btn-primary" href={SHOP_URL}>Shop All Treats</a>
          </div>
        </section>

        {/* ── Shop by collection ── */}
        <section className="section-block" data-reveal aria-labelledby="collections-heading">
          <div className="section-head">
            <p className="eyebrow">Shop by category</p>
            <h2 id="collections-heading">Find your flavor</h2>
          </div>
          <div className="collection-grid">
            {collections.map((c) => (
              <a key={c.label} className="collection-card" href={c.href}>
                <div className="collection-media">
                  <img src={c.image} alt={c.label} loading="lazy" />
                </div>
                <div className="collection-body">
                  <h3>{c.label}</h3>
                  <p>{c.blurb}</p>
                  <span className="collection-link">Shop {c.label} &rarr;</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Heritage ── */}
        <section id="heritage" className="heritage" data-reveal aria-labelledby="heritage-heading">
          <div className="heritage-media">
            <img src="/brand/state-fair-booth.jpeg" alt="Our Minnesota State Fair booth" loading="lazy" />
            <img className="heritage-media-secondary" src="/brand/community-delivery.jpg" alt="Hand-delivering fresh nuts to the community" loading="lazy" />
          </div>
          <div className="heritage-copy">
            <p className="eyebrow">Our story</p>
            <h2 id="heritage-heading">40 years of family, roasting, and "just one more."</h2>
            <p>
              Simply Nuts &amp; More started as a family business in 1986, and we still roast and mix
              everything in small batches right here in Chanhassen, Minnesota. If you've wandered the
              Minnesota State Fair, there's a good chance you've followed your nose to our booth — we've
              been a fair favorite for nearly four decades.
            </p>
            <p>
              We're not a faceless brand. We're the folks who taste every batch, fill every bag, and still
              get excited when someone says it's the freshest nut they've ever had. (Chippy, our resident
              squirrel, takes full credit.)
            </p>
            <div className="cta-row">
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/about')}>
                Read Our Story
              </button>
            </div>
          </div>
        </section>

        {/* ── Social proof ── */}
        <section className="section-block" data-reveal aria-labelledby="reviews-heading">
          <div className="section-head">
            <p className="eyebrow">From our regulars</p>
            <h2 id="reviews-heading">Loved by Minnesotans (and beyond)</h2>
          </div>
          <div className="review-grid">
            {reviews.map((r) => (
              <figure key={r.name} className="review-card">
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption>
                  <strong>{r.name}</strong>
                  <span>{r.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Corporate gifting (secondary) ── */}
        <section className="corp-band" data-reveal aria-labelledby="corp-heading">
          <div className="corp-media">
            <img src="/brand/corp-containers.jpg" alt="Laser-engraved corporate gift containers filled with treats" loading="lazy" />
          </div>
          <div className="corp-copy">
            <p className="eyebrow eyebrow-light">Corporate gifting</p>
            <h2 id="corp-heading">Your logo, laser-engraved on a gift they'll actually remember.</h2>
            <p>
              For client and team gifts, we engrave your logo onto premium boxes, tins, and canisters, fill
              them with the treats you choose, and ship them straight to every name on your list.
            </p>
            <ol className="corp-steps">
              <li><span>1</span> Pick a container and add your logo</li>
              <li><span>2</span> Choose the nuts, mixes &amp; chocolates</li>
              <li><span>3</span> Send your list — we engrave, pack &amp; ship</li>
            </ol>
            <div className="cta-row">
              <button className="btn btn-light" type="button" onClick={() => navigate('/contact')}>
                Explore Corporate Gifting
              </button>
            </div>
          </div>
        </section>

        {/* ── Interactive engraving customizer (keeps the centerpiece playful) ── */}
        <section className="studio-controls" data-reveal aria-label="Preview the engraver">
          <div className="control-group">
            <p>Container Material</p>
            <div className="pill-row">
              {(Object.keys(containers) as ContainerKey[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`pill ${container === item ? 'is-active' : ''}`}
                  onClick={() => setContainer(item)}
                >
                  {containers[item].label}
                </button>
              ))}
            </div>
          </div>

          <label className="control-group" htmlFor="engrave-message">
            <span>Engraving Text</span>
            <input
              id="engrave-message"
              value={engravingText}
              onChange={(event) => setEngravingText(event.target.value.slice(0, 30))}
            />
          </label>

          <label className="checkbox-row" htmlFor="include-chippy">
            <input
              id="include-chippy"
              type="checkbox"
              checked={includeChippy}
              onChange={(event) => setIncludeChippy(event.target.checked)}
            />
            Include Chippy in logo line
          </label>

          <button className="btn btn-primary" type="button" onClick={replayLaser}>
            Replay Engraver
          </button>
        </section>

        {/* ── Newsletter capture ── */}
        <section className="newsletter" data-reveal aria-labelledby="newsletter-heading">
          <img className="newsletter-chippy" src="/brand/chippy.png" alt="" aria-hidden="true" />
          <h2 id="newsletter-heading">Get the fresh batch news</h2>
          <p>
            New roasts, seasonal mixes, fair dates, and the occasional Chippy-approved deal. No spam, just
            the good stuff.
          </p>
          {subscribed ? (
            <p className="newsletter-success" role="status">
              You're in! Watch your inbox for fresh-batch news.
            </p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="btn btn-primary" type="submit">Sign Me Up</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
