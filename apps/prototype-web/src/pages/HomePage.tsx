import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {SHOP_URL} from '../config';

type ContainerKey = 'wood' | 'bamboo' | 'tin';

type ContainerPreset = {
  alt: string;
  label: string;
};

type CardContent = {
  badge: string;
  cta: string;
  image: string;
  lines: string[];
  title: string;
};

const containers: Record<ContainerKey, ContainerPreset> = {
  wood: {label: 'Wooden Box', alt: 'Cartoon-styled wooden gift box top'},
  bamboo: {label: 'Bamboo Container', alt: 'Cartoon-styled bamboo container top'},
  tin: {label: 'Gift Tin', alt: 'Cartoon-styled gift tin top'}
};

const stickyPhases: CardContent[][] = [
  [
    {
      badge: 'Minnesota State Fair',
      title: 'Catch us where Minnesota gathers.',
      lines: [
        'A State Fair favorite for nearly four decades.',
        'Free samples, full bags, and a lot of "just one more."',
        'Find our booth and seasonal market dates each year.'
      ],
      cta: 'See Where to Find Us',
      image: '/brand/state-fair.jpeg'
    },
    {
      badge: 'Shop By The Pound',
      title: 'Your favorites, shipped fresh.',
      lines: [
        'Roasted nuts, trail mixes, and chocolates by the pound.',
        'Small-batch and made to order — never stale.',
        '1, 2, and 3 lb bags for snacking or sharing.'
      ],
      cta: 'Shop The Treats',
      image: '/brand/retail-honey-almonds.jpg'
    },
    {
      badge: 'Corporate Gifting',
      title: 'Gifts your clients actually remember.',
      lines: [
        'Custom laser-engraved boxes, tins, and canisters.',
        'Filled with the same treats we are famous for.',
        'Shipped direct to every name on your list.'
      ],
      cta: 'Explore Corporate Gifts',
      image: '/brand/corp-containers.jpg'
    }
  ],
  [
    {
      badge: 'Events + Dates',
      title: 'Where to find us this season.',
      lines: [
        'Minnesota State Fair: Aug 22 - Sep 2',
        'Twin Cities Holiday Market: Nov 14 - Nov 16',
        'More markets added through the fall.'
      ],
      cta: 'View Calendar',
      image: '/brand/state-fair.jpeg'
    },
    {
      badge: 'Best Sellers',
      title: 'Crowd favorites, year after year.',
      lines: [
        'Secret Peanuts (Butter Toffee) — our signature.',
        'Cranberry Trail Mix — sweet-tart and snackable.',
        'Pecan Pralines — a little indulgence.',
        'Chocolate Covered Almonds — a timeless classic.'
      ],
      cta: 'Shop Best Sellers',
      image: '/brand/retail-cran-trailmix.jpg'
    },
    {
      badge: 'Corporate, Simplified',
      title: 'From your logo to their doorstep.',
      lines: [
        '1. Pick a container and add your logo.',
        '2. Choose the nuts, mixes, and chocolates.',
        '3. Upload your recipient list.',
        '4. We engrave, pack, and ship it all.'
      ],
      cta: 'Start a Corporate Order',
      image: '/brand/corp-tins-v3.jpg'
    }
  ]
];

const productHighlights = [
  {title: 'Butter Toffee Peanuts', image: '/brand/butter-toffee-peanuts.jpg'},
  {title: 'Honey Roasted Cashews', image: '/brand/retail-honey-cashews.jpeg'},
  {title: 'Chocolate Almonds', image: '/brand/retail-choc-almonds.jpg'},
  {title: 'Cranberry Trail Mix', image: '/brand/retail-cran-trailmix.jpg'}
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
  const [stickyPhase, setStickyPhase] = useState(0);

  const animationFrameRef = useRef<number | undefined>(undefined);
  const burnStartRef = useRef(0);
  const stickySectionRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    const updateStickyProgress = () => {
      if (!stickySectionRef.current) return;

      const rect = stickySectionRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = clamp(-rect.top / scrollable, 0, 1);
      const nextPhase = progress < 0.52 ? 0 : 1;
      setStickyPhase((current) => (current === nextPhase ? current : nextPhase));
    };

    updateStickyProgress();
    window.addEventListener('scroll', updateStickyProgress, {passive: true});
    window.addEventListener('resize', updateStickyProgress);

    return () => {
      window.removeEventListener('scroll', updateStickyProgress);
      window.removeEventListener('resize', updateStickyProgress);
    };
  }, []);

  return (
    <div className="page-shell">
      <header className="topbar" aria-label="Business contact">
        <span>Chanhassen, Minnesota</span>
        <span>1-888-449-6887</span>
        <span>Family-run since 1987</span>
      </header>

      <main>
        <section className="hero-shell" data-reveal>
          <div className="hero-copy-column">
            <img className="logo-lockup" src="/brand/logo-main.png" alt="Simply Nuts and More" />
            <p className="eyebrow">Family-crafted in Minnesota since 1987</p>
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
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/contact')} aria-label="Learn about corporate gifting">
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

        <section className="studio-controls" data-reveal aria-label="Interactive customizer controls">
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

        <section className="locked-section" ref={stickySectionRef}>
          <div className={`locked-sticky phase-${stickyPhase}`} data-reveal>
            <h2>Three ways to enjoy Simply Nuts.</h2>
            <p className="locked-subtitle">
              Snack at home, catch us at the fair, or gift your whole client list. Keep scrolling for
              what's in season.
            </p>

            <div className="locked-grid">
              {[0, 1, 2].map((column) => (
                <article key={column} className="locked-card">
                  {[0, 1].map((phase) => {
                    const content = stickyPhases[phase][column];
                    return (
                      <div key={phase} className={`locked-pane phase-${phase}`}>
                        <img src={content.image} alt={content.title} loading="lazy" />
                        <p className="locked-badge">{content.badge}</p>
                        <h3>{content.title}</h3>
                        <ul>
                          {content.lines.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                        <button className="btn btn-secondary" type="button">
                          {content.cta}
                        </button>
                      </div>
                    );
                  })}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="tool-preview" data-reveal>
          <div className="tool-preview-copy">
            <p className="eyebrow">Corporate Gifting</p>
            <h2>Your logo, laser-engraved.</h2>
            <p>
              For holiday and client gifts, we engrave your logo onto premium boxes, tins, and canisters,
              fill them with the treats you choose, and ship them straight to your recipients.
            </p>
          </div>
          <div className="tool-preview-cards">
            <article>
              <h3>Step 1</h3>
              <p>Choose a container and add your logo</p>
            </article>
            <article>
              <h3>Step 2</h3>
              <p>Pick the nuts, mixes, and chocolates</p>
            </article>
            <article>
              <h3>Step 3</h3>
              <p>Upload recipients and we ship it all</p>
            </article>
          </div>
        </section>

        <section className="catalog" data-reveal aria-label="Featured treats">
          <h2>Shop Our Freshly Roasted Treats</h2>
          <p>Premium nuts, trail mixes, and chocolates — by the pound, shipped fresh from Minnesota.</p>
          <div className="featured-grid">
            {productHighlights.map((item) => (
              <a key={item.title} className="featured-card" href={SHOP_URL}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <strong>{item.title}</strong>
              </a>
            ))}
          </div>
          <a className="btn btn-primary featured-shop-all" href={SHOP_URL}>Shop All Treats</a>
        </section>
      </main>
    </div>
  );
}
