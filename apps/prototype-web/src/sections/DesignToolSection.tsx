import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import './designtool.css';

/* --------------------------------------------------------------------------
   Design your own gift — an interactive laser-engraving teaser.
   Client-side only: no uploads, no network, no backend. useState + CSS only.
   -------------------------------------------------------------------------- */

const CONTAINERS = [
  {
    id: 'box',
    name: 'Wooden Box',
    spec: '4 lb · hinged lid',
    detail: 'Solid wood, sanded smooth. Burned deep enough that you feel the mark with a thumb.',
  },
  {
    id: 'bamboo',
    name: 'Bamboo Canister',
    spec: '2 lb · screw top',
    detail: 'Pale renewable bamboo. The lightest grain we run — engraving reads high-contrast.',
  },
  {
    id: 'tin',
    name: 'Gift Tin',
    spec: '3 lb · stackable',
    detail: 'Powder-coated steel with a brushed face. Etched, not printed, so it never rubs off.',
  },
] as const;

const FILLS = [
  {
    id: 'secret',
    name: 'Secret Peanuts',
    note: 'Butter toffee — the happy accident',
    img: '/brand/secret-peanuts.jpg',
  },
  {
    id: 'cashews',
    name: 'Jumbo Cashews',
    note: 'Roasted to order, never pre-roasted',
    img: '/brand/cashews.jpg',
  },
  {
    id: 'cranberry',
    name: 'Cranberry Trail Mix',
    note: 'House blend, heavy on the cranberries',
    img: '/brand/cranberry-trail-mix.jpg',
  },
] as const;

type ContainerId = (typeof CONTAINERS)[number]['id'];
type FillId = (typeof FILLS)[number]['id'];

const MAX_CHARS = 22;
const DEFAULT_TEXT = 'YOUR COMPANY';
const SWAP_MS = 560;

/** Custom-property style helper (React.CSSProperties has no index signature). */
function vars(v: Record<string, string | number>): CSSProperties {
  return v as unknown as CSSProperties;
}

/* -------------------------------------------------------------------------- */

type VesselPhase = 'in' | 'out';

interface VesselProps {
  container: ContainerId;
  engraving: string;
  ghost: boolean;
  fills: readonly FillId[];
  burnKey: number;
  reduced: boolean;
  phase: VesselPhase;
}

function Vessel({ container, engraving, ghost, fills, burnKey, reduced, phase }: VesselProps) {
  return (
    <div
      className={`dt-vessel dt-vessel--${container} dt-vessel--${phase}`}
      aria-hidden={phase === 'out' ? true : undefined}
    >
      <div className="dt-lid">
        <span className="dt-lid__grain" aria-hidden="true" />
        <span className="dt-plaque">
          <span className={`dt-engraved${ghost ? ' dt-engraved--ghost' : ''}`}>{engraving}</span>
          <span className="dt-plaque__rule" aria-hidden="true" />
          <span className="dt-plaque__mark" aria-hidden="true">
            Simply Nuts &amp; More · Est. 1986
          </span>
        </span>
        {!reduced && phase === 'in' ? (
          <span key={burnKey} className="dt-laser" aria-hidden="true" />
        ) : null}
        <span className="dt-lid__sheen" aria-hidden="true" />
      </div>

      <span className="dt-rim" aria-hidden="true" />

      <div className="dt-tray">
        <span className="dt-tray__grain" aria-hidden="true" />
        <ul className="dt-cells">
          {FILLS.map((f) => {
            const on = fills.includes(f.id);
            return (
              <li key={f.id} className={`dt-cell${on ? ' dt-cell--on' : ''}`}>
                {on ? (
                  <img
                    className="dt-cell__img"
                    src={f.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span className="dt-cell__well" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </div>

      <span className="dt-cast" aria-hidden="true" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function DesignToolSection() {
  const [container, setContainer] = useState<ContainerId>('box');
  const [previous, setPrevious] = useState<ContainerId | null>(null);
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [fills, setFills] = useState<FillId[]>(['secret']);
  const [burnKey, setBurnKey] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState('');

  const sectionRef = useRef<HTMLElement | null>(null);
  const swapTimer = useRef<number | null>(null);
  const firstRun = useRef(true);

  /* --- reduced motion -------------------------------------------------- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /* --- scroll reveal --------------------------------------------------- */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* --- clean up the crossfade timer ------------------------------------ */
  useEffect(
    () => () => {
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    },
    [],
  );

  const engraving = text.trim() === '' ? DEFAULT_TEXT : text.trim();
  const ghost = text.trim() === '';

  const activeContainer = useMemo(
    () => CONTAINERS.find((c) => c.id === container) ?? CONTAINERS[0],
    [container],
  );

  const fillNames = useMemo(
    () => FILLS.filter((f) => fills.includes(f.id)).map((f) => f.name),
    [fills],
  );

  /* --- debounced laser burn + screen-reader announcement ---------------- */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      setBurnKey((k) => k + 1);
      setLive(
        `${activeContainer.name} engraved “${engraving}”, filled with ${
          fillNames.length > 0 ? fillNames.join(', ') : 'nothing yet'
        }.`,
      );
    }, 220);
    return () => window.clearTimeout(t);
  }, [engraving, activeContainer, fillNames]);

  /* --- handlers --------------------------------------------------------- */
  function chooseContainer(next: ContainerId) {
    if (next === container) return;
    setPrevious(container);
    setContainer(next);
    if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => setPrevious(null), SWAP_MS);
  }

  function toggleFill(id: FillId) {
    setFills((current) =>
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id],
    );
  }

  const summary =
    fillNames.length === 0
      ? 'No fill chosen yet — pick at least one.'
      : `Filled with ${fillNames.join(' + ')}.`;

  return (
    <section ref={sectionRef} className="dt" aria-labelledby="dt-title">
      <span className="dt__pool" aria-hidden="true" />
      <span className="dt__vignette" aria-hidden="true" />

      <div className="dt__inner max-w-6xl mx-auto px-4">
        <header className="dt-head">
          <p className="dt-eyebrow dt-reveal" style={vars({ '--dt-i': 0 })}>
            The engraving bench
          </p>
          <h2 id="dt-title" className="dt-title dt-reveal" style={vars({ '--dt-i': 1 })}>
            Design your own gift
          </h2>
          <p className="dt-lede dt-reveal" style={vars({ '--dt-i': 2 })}>
            Pick a vessel, type the name, watch it burn in. This is the same bench we have been
            running for forty years — only now the laser is a little faster than Grandpa Carney was.
          </p>
        </header>

        <div className="dt-grid">
          {/* ---------------- PREVIEW ---------------- */}
          <div className="dt-preview dt-reveal" style={vars({ '--dt-i': 3 })}>
            <div className="dt-stage">
              {previous !== null ? (
                <Vessel
                  key={`out-${previous}`}
                  container={previous}
                  engraving={engraving}
                  ghost={ghost}
                  fills={fills}
                  burnKey={burnKey}
                  reduced={reduced}
                  phase="out"
                />
              ) : null}
              <Vessel
                key={`in-${container}`}
                container={container}
                engraving={engraving}
                ghost={ghost}
                fills={fills}
                burnKey={burnKey}
                reduced={reduced}
                phase="in"
              />
            </div>

            <p className="dt-summary" aria-live="polite">
              <strong>{activeContainer.name}</strong>
              <span className="dt-summary__dot" aria-hidden="true" />
              {summary}
            </p>
            <p className="dt-note">
              {activeContainer.detail} Every order gets a proof before we burn anything.
            </p>
            <span className="dt-sr">{live}</span>
          </div>

          {/* ---------------- CONTROLS ---------------- */}
          <div className="dt-panel glass">
            {/* 1 — container */}
            <div className="dt-step">
              <p className="dt-step__head">
                <span className="dt-step__num" aria-hidden="true">
                  1
                </span>
                <span className="dt-step__label" id="dt-container-label">
                  Choose a vessel
                </span>
              </p>
              <div className="dt-options" role="group" aria-labelledby="dt-container-label">
                {CONTAINERS.map((c) => {
                  const on = c.id === container;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`dt-option${on ? ' dt-option--on' : ''}`}
                      aria-pressed={on}
                      onClick={() => chooseContainer(c.id)}
                    >
                      <span className={`dt-swatch dt-swatch--${c.id}`} aria-hidden="true" />
                      <span className="dt-option__text">
                        <span className="dt-option__name">{c.name}</span>
                        <span className="dt-option__spec">{c.spec}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2 — engraving */}
            <div className="dt-step">
              <p className="dt-step__head">
                <span className="dt-step__num" aria-hidden="true">
                  2
                </span>
                <label className="dt-step__label" htmlFor="dt-engrave-input">
                  Name to engrave
                </label>
              </p>
              <div className="dt-field">
                <input
                  id="dt-engrave-input"
                  className="dt-input"
                  type="text"
                  value={text}
                  maxLength={MAX_CHARS}
                  placeholder={DEFAULT_TEXT}
                  autoComplete="organization"
                  spellCheck={false}
                  onChange={(e) => setText(e.target.value)}
                  aria-describedby="dt-engrave-help"
                />
                <span className="dt-count" aria-hidden="true">
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
              <p className="dt-help" id="dt-engrave-help">
                Up to {MAX_CHARS} characters. Logos, dates and a second line are all doable — we
                just handle those on the proof.
              </p>
            </div>

            {/* 3 — fills */}
            <div className="dt-step">
              <p className="dt-step__head">
                <span className="dt-step__num" aria-hidden="true">
                  3
                </span>
                <span className="dt-step__label" id="dt-fill-label">
                  Fill it up
                </span>
              </p>
              <div className="dt-chips" role="group" aria-labelledby="dt-fill-label">
                {FILLS.map((f) => {
                  const on = fills.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`dt-chip${on ? ' dt-chip--on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleFill(f.id)}
                    >
                      <img
                        className="dt-chip__img"
                        src={f.img}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="dt-chip__text">
                        <span className="dt-chip__name">{f.name}</span>
                        <span className="dt-chip__note">{f.note}</span>
                      </span>
                      <span className="dt-chip__tick" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dt-cta">
              <Link className="glass-pill glass-pill--solid dt-cta__link" to="/contact">
                Start your corporate order
              </Link>
              <p className="dt-cta__note">
                The full design studio — logo upload, live proof, recipient lists — is coming soon.
                Until then a real person reads every request, usually within a day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
