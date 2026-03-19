import React, {useEffect, useRef, useState} from 'react';
import {getMockProducts} from '@snm/core';

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
      badge: 'Retail + State Fair',
      title: 'In-person channels that build trust and momentum.',
      lines: [
        'Seasonal fairs and weekend shows keep the brand highly visible.',
        'Sampling-first booth strategy drives immediate product trial.',
        'Event pages can now feed online campaigns directly.'
      ],
      cta: 'Explore Events',
      image: '/brand/state-fair.jpeg'
    },
    {
      badge: 'Retail Ecommerce',
      title: 'A premium online shelf for year-round growth.',
      lines: [
        'Product storytelling, bundles, and pairings increase AOV.',
        'Newsletter + campaign hooks support seasonal promotions.',
        'Fast filters and category pages reduce browsing friction.'
      ],
      cta: 'Shop By The Pound',
      image: '/brand/retail-honey-almonds.jpg'
    },
    {
      badge: 'Corporate Gifting',
      title: 'Highest-revenue path designed for enterprise speed.',
      lines: [
        'Guided engraving + recipient upload in one workflow.',
        'Draft save and internal approvals built-in.',
        'Direct-to-recipient fulfillment as a premium service.'
      ],
      cta: 'Start Corporate Order',
      image: '/brand/corp-containers.jpg'
    }
  ],
  [
    {
      badge: 'Events + Dates',
      title: 'Upcoming retail events and booth details.',
      lines: [
        'Minnesota State Fair: Aug 22 - Sep 2',
        'Twin Cities Holiday Market: Nov 14 - Nov 16',
        'Corporate Sampling Week: Oct 6 - Oct 10',
        'All event pages include map links and featured products.'
      ],
      cta: 'View Calendar',
      image: '/brand/state-fair.jpeg'
    },
    {
      badge: 'Top Retail SKUs',
      title: 'Hero products with photos and conversion-ready copy.',
      lines: [
        'Secret Peanuts (Butter Toffee) - signature favorite',
        'Cranberry Trail Mix - sweet + tart seasonal balance',
        'Pecan Pralines - premium gift-forward indulgence',
        'Chocolate Almonds - classic high-margin staple'
      ],
      cta: 'Browse Best Sellers',
      image: '/brand/retail-cran-trailmix.jpg'
    },
    {
      badge: 'Corporate Workflow',
      title: 'How enterprise buyers move from idea to shipped gifts.',
      lines: [
        '1. Select container + add logo/message',
        '2. Validate artwork + request cleanup',
        '3. Upload recipients via CSV/XLSX/Sheets',
        '4. Approve and track production-to-shipping status',
        'Example clients: Banks, contractors, clinics, manufacturers'
      ],
      cta: 'See Workflow',
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

  const products = getMockProducts();
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
            <p className="eyebrow">Animated Hero Prototype</p>
            <h1>High-power laser engraving, center stage.</h1>
            <p>
              Cartoon-styled material, raster laser passes, sparks, smoke, and a progressive burn reveal
              of your main logo with Chippy.
            </p>
            <div className="cta-row">
              <button className="btn btn-primary" type="button" onClick={replayLaser}>
                Replay Laser Burn
              </button>
              <button className="btn btn-secondary" type="button">
                Start Corporate Order
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
            <h2>Retail + Ecommerce + Corporate, one cohesive system.</h2>
            <p className="locked-subtitle">
              This frame is pinned while content transitions. Scroll through this zone to see the second
              data state replace the first.
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
            <p className="eyebrow">Next Section</p>
            <h2>Corporate Gift Design Studio</h2>
            <p>
              After the locked narrative section, the page scrolls into the full builder workflow: artwork
              upload, engraving proof, recipient import, and order approval.
            </p>
          </div>
          <div className="tool-preview-cards">
            <article>
              <h3>Step 1</h3>
              <p>Choose container and add logo + message</p>
            </article>
            <article>
              <h3>Step 2</h3>
              <p>Validate design quality and request cleanup</p>
            </article>
            <article>
              <h3>Step 3</h3>
              <p>Upload recipients and finalize shipment</p>
            </article>
          </div>
        </section>

        <section className="catalog" data-reveal>
          <h2>Shared Commerce Data (Prototype Layer)</h2>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <strong>{product.title}</strong>
                <span>${product.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
