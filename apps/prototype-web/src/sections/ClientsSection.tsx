/**
 * ClientsSection — "Trusted by" bridge band.
 *
 * A deliberately slim room between two heavier (dark) sections: warm neutral
 * gradient, hairline gold rules top and bottom, the shared LogoMarquee in its
 * glass variant, three verbatim testimonials as quiet glass quote cards, and
 * the ~96% repeat-customer stat.
 *
 * ⚠ Client list: this renders TESTIMONIAL_CLIENTS only. The ENGRAVED_CLIENTS
 * (K2 Capital, Orijin Stone, Motorwerks BMW) are read off our own product
 * photography and are NOT cleared for use as an endorsement logo wall — see
 * the permission note in components/LogoMarquee.tsx. The testimonial
 * businesses are already published on simplynutsandmore.com/testimonials.
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import LogoMarquee, { TESTIMONIAL_CLIENTS } from '../components/LogoMarquee';
import './clients.css';

type RevealStyle = CSSProperties & { '--reveal-i'?: number };

/** Stagger index consumed by `transition-delay: calc(var(--reveal-i) * 90ms)`. */
function reveal(index: number): RevealStyle {
  return { '--reveal-i': index };
}

type Testimonial = {
  quote: string;
  who: string;
  where?: string;
};

/** Verbatim, as published on simplynutsandmore.com/testimonials. */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The pistachios are always a hit with our customers. Always fresh, and always delivered on time for the holidays.',
    who: 'Globe C.',
    where: 'San Francisco, CA',
  },
  {
    quote:
      'His products are not only tasty but have a personal touch that our clients appreciate and look forward to receiving.',
    who: 'VAA, LLC',
  },
  {
    quote: 'The service is friendly and the quality is exceptional.',
    who: 'Denise C., Honeywood Builders',
    where: 'Eden Prairie, MN',
  },
];

export default function ClientsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // No IntersectionObserver (SSR / very old browser) → show the content.
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clients"
      aria-labelledby="clients-heading"
      className={`clients-band py-20 md:py-28${isVisible ? ' is-visible' : ''}`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="clients-band__head">
          <p className="clients-band__eyebrow clients-reveal" style={reveal(0)}>
            Repeat business
          </p>

          <h2 id="clients-heading" className="clients-band__title clients-reveal" style={reveal(1)}>
            They order once. Then they keep ordering.
          </h2>

          <p className="glass clients-stat clients-reveal" style={reveal(2)}>
            <span className="clients-stat__num">~96%</span>
            <span className="clients-stat__label">repeat customers</span>
          </p>
        </div>

        <div className="clients-band__marquee clients-reveal" style={reveal(3)}>
          <LogoMarquee variant="glass" clients={TESTIMONIAL_CLIENTS} />
        </div>

        <ul className="clients-quotes">
          {TESTIMONIALS.map((testimonial, index) => (
            <li key={testimonial.who}>
              <figure className="glass clients-quote clients-reveal" style={reveal(4 + index)}>
                <span className="clients-quote__mark" aria-hidden="true">
                  &ldquo;
                </span>

                <blockquote className="clients-quote__body">
                  <p>{testimonial.quote}</p>
                </blockquote>

                <figcaption className="clients-quote__cite">
                  {testimonial.who}
                  {testimonial.where ? (
                    <span className="clients-quote__where">{testimonial.where}</span>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
