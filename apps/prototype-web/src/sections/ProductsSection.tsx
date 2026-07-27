import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Product } from '@snm/types/product';
import { SHOP_COLLECTIONS } from '../config';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';
import './products.css';

/**
 * "The Harvest" — the bright, appetizing room that lands right after the dark
 * hero. Three featured retail products on a cream boutique shelf, a category
 * row, and the shop-everything CTA.
 *
 * Data comes from useFeaturedProducts(), which always resolves to three real
 * items (live Shopify when configured, curated fallback otherwise) so this
 * section can never render an empty or broken state.
 */

/** Lets us hand `--i` (the stagger index) to the element's inline style safely. */
type StyleWithVars = CSSProperties & { [key: `--${string}`]: string | number };

const stagger = (index: number): StyleWithVars => ({ '--i': index });

const CATEGORIES: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Roasted Nuts', href: SHOP_COLLECTIONS.nuts },
  { label: 'Trail Mixes', href: SHOP_COLLECTIONS.trailMixes },
  { label: 'Chocolates', href: SHOP_COLLECTIONS.chocolates },
];

/** Last-resort art if a Shopify product ever arrives without an image. */
const IMAGE_FALLBACK = '/brand/tins.jpg';

function formatPrice(price: number, currency?: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency ?? 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `$${price.toFixed(2)}`;
  }
}

function productHref(product: Product): string {
  return product.url ?? SHOP_COLLECTIONS.all;
}

export default function ProductsSection() {
  const products = useFeaturedProducts();
  const sectionRef = useRef<HTMLElement>(null);

  /**
   * Only opt into the hidden-then-reveal choreography when we can actually
   * finish it: IntersectionObserver present and motion welcome. Computed during
   * the first render so there is never a flash of hidden content.
   */
  const [animate] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (!animate) return;
    const root = sectionRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-harvest-reveal]'));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
    // `products` identity changes when live Shopify data replaces the fallback,
    // which swaps in brand-new card nodes that still need observing.
  }, [animate, products]);

  return (
    <section
      ref={sectionRef}
      id="harvest"
      aria-labelledby="harvest-heading"
      className={`harvest py-24 md:py-32 lg:py-40${animate ? ' harvest--animate' : ''}`}
    >
      <div className="harvest__inner mx-auto w-full max-w-6xl px-6">
        {/* --- editorial header ------------------------------------------- */}
        <header className="flex flex-col gap-6 md:gap-8">
          <p className="harvest__eyebrow harvest__reveal harvest__reveal--soft" data-harvest-reveal style={stagger(0)}>
            The Harvest
          </p>
          <h2
            id="harvest-heading"
            className="harvest__title harvest__reveal harvest__reveal--soft"
            data-harvest-reveal
            style={stagger(1)}
          >
            Small batches.
            <em>Serious cravings.</em>
          </h2>
          <p className="harvest__lede harvest__reveal harvest__reveal--soft" data-harvest-reveal style={stagger(2)}>
            Everything is roasted to order — never pre-roasted, never sitting in a warehouse getting
            sad. Here are three of the ones people drive across the metro for.
          </p>
        </header>

        {/* --- the shelf ---------------------------------------------------- */}
        <ul className="mt-16 grid list-none grid-cols-1 gap-12 p-0 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-14">
          {products.map((product, index) => (
            <li
              key={product.id}
              className="harvest__cell harvest__reveal"
              data-harvest-reveal
              style={stagger(index)}
            >
              <article className="glass glass--bright glass-card harvest__card">
                <div className="harvest__media">
                  <img
                    className="harvest__img"
                    src={product.imageUrl ?? IMAGE_FALLBACK}
                    alt={product.imageAlt ?? product.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="harvest__body">
                  <h3 className="harvest__name">{product.title}</h3>
                  <p className="harvest__price">{formatPrice(product.price, product.currency)}</p>
                  <a
                    className="harvest__shop"
                    href={productHref(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Shop ${product.title} (opens in a new tab)`}
                  >
                    <span className="harvest__shop-label">Shop</span>
                    <span className="harvest__arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/* --- category chips ------------------------------------------------ */}
        <hr className="harvest__rule mt-24 md:mt-28" />

        <nav
          aria-label="Shop by category"
          className="harvest__reveal harvest__reveal--soft mt-12 flex flex-col gap-6 md:flex-row md:items-center md:gap-10"
          data-harvest-reveal
          style={stagger(0)}
        >
          <p className="harvest__aside-label">Browse by craving</p>
          <ul className="harvest__chips">
            {CATEGORIES.map((category) => (
              <li key={category.href}>
                <a
                  className="glass glass--bright glass-pill harvest__chip"
                  href={category.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {category.label}
                  <span className="harvest__sr"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* --- closing CTA ---------------------------------------------------- */}
        <div
          className="harvest__reveal harvest__reveal--soft mt-16 flex flex-col items-start gap-6 md:mt-20 md:flex-row md:items-center md:gap-10"
          data-harvest-reveal
          style={stagger(1)}
        >
          <a
            className="glass-pill glass-pill--solid harvest__cta-link"
            href={SHOP_COLLECTIONS.all}
            target="_blank"
            rel="noopener noreferrer"
          >
            Shop all treats
            <span className="harvest__arrow" aria-hidden="true">
              &rarr;
            </span>
            <span className="harvest__sr"> (opens in a new tab)</span>
          </a>
          <p className="harvest__cta-note">
            Roasted to order in Chanhassen, Minnesota. Family-run since 1986.
          </p>
        </div>
      </div>
    </section>
  );
}
