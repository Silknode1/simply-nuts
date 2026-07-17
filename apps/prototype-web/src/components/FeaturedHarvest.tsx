import { forwardRef } from 'react';
import type { Product } from '@snm/types/product';
import { SHOP_COLLECTIONS } from '../config';

/**
 * FeaturedHarvest — the journey's closing beat: while the island parks to
 * the left, a warm-glass panel of real featured products blooms in on the
 * right. Purely presentational; the hero's ScrollTrigger drives visibility
 * imperatively via the forwarded ref (opacity/transform + `.on`/`.live`
 * classes) so nothing re-renders during scroll.
 */
const FeaturedHarvest = forwardRef<HTMLDivElement, { products: Product[] }>(
  function FeaturedHarvest({ products }, ref) {
    return (
      <aside ref={ref} className="fih__harvest" aria-label="Featured treats">
        <div className="fih__harvest-inner">
          <header className="fih__harvest-head">
            <p className="fih__harvest-eyebrow">The harvest, bagged</p>
            <h2 className="fih__harvest-title">Fresh from the orchard</h2>
          </header>
          <div className="fih__harvest-cards">
            {products.map((p, i) => (
              <a
                key={p.id}
                className="glass glass-card fih__harvest-card"
                style={{ transitionDelay: `${i * 110}ms` }}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.imageAlt ?? p.title} loading="lazy" draggable={false} />
                )}
                <span className="fih__harvest-meta">
                  <strong>{p.title}</strong>
                  <em>
                    ${p.price.toFixed(2)}
                    <i aria-hidden="true"> · Shop →</i>
                  </em>
                </span>
              </a>
            ))}
          </div>
          <a
            className="glass-pill glass-pill--solid fih__harvest-all"
            href={SHOP_COLLECTIONS.all}
            target="_blank"
            rel="noopener noreferrer"
          >
            Shop All Treats
          </a>
        </div>
      </aside>
    );
  },
);

export default FeaturedHarvest;
