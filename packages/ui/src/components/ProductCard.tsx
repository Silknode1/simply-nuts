import React from 'react';

export interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image?: string;
  emoji?: string;
  features?: string[];
  onAddToCart?: () => void;
  onCustomize?: () => void;
  children?: React.ReactNode;
}

export function ProductCard({
  name,
  description,
  price,
  image,
  emoji,
  features,
  onAddToCart,
  onCustomize,
  children,
}: ProductCardProps) {
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid var(--color-wood-100, #f5e6d0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {(image || emoji) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            background: 'var(--color-wood-50, #fdf8f0)',
            fontSize: emoji ? '5rem' : undefined,
          }}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <span role="img" aria-hidden="true">{emoji}</span>
          )}
        </div>
      )}

      <div style={{ padding: '1.5rem' }}>
        <h3
          style={{
            margin: '0 0 0.5rem',
            fontFamily: 'var(--font-display, serif)',
            fontWeight: 700,
            color: 'var(--color-wood-900, #3d2410)',
          }}
        >
          {name}
        </h3>

        <p
          style={{
            margin: '0 0 0.75rem',
            fontSize: '0.875rem',
            color: 'var(--color-wood-500, #a86b35)',
          }}
        >
          {description}
        </p>

        {features && features.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 1rem',
              display: 'grid',
              gap: '0.25rem',
            }}
          >
            {features.map((f) => (
              <li
                key={f}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-wood-600, #8b5529)',
                }}
              >
                <span style={{ color: 'var(--color-forest-500, #3d8b3d)', marginRight: '0.5rem' }}>
                  &#10003;
                </span>
                {f}
              </li>
            ))}
          </ul>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-burn, #c45e20)',
            }}
          >
            ${price.toFixed(2)}
          </span>
        </div>

        {children}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onAddToCart && (
            <button
              type="button"
              onClick={onAddToCart}
              aria-label={`Add ${name} to cart`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--color-burn, #c45e20)',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Add to Cart
            </button>
          )}
          {onCustomize && (
            <button
              type="button"
              onClick={onCustomize}
              aria-label={`Customize ${name}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--color-burn, #c45e20)',
                fontWeight: 600,
                borderRadius: '0.5rem',
                border: '2px solid var(--color-burn, #c45e20)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
