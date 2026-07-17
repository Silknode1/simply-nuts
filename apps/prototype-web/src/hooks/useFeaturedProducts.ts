import { useEffect, useState } from 'react';
import type { Product } from '@snm/types/product';
import { createShopifyAdapter } from '@snm/core';
import { SHOP_URL } from '../config';

/**
 * Featured products for the homepage journey's closing reveal.
 *
 * Pulls real products from the Shopify Storefront API when
 * VITE_SHOPIFY_STORE_DOMAIN + VITE_SHOPIFY_STOREFRONT_TOKEN are configured
 * (apps/prototype-web/.env.local). The homepage must never look broken, so
 * any missing config, network failure, or empty catalog falls back to a
 * curated static trio that links into the Shopify store.
 *
 * ⚠ Use a PUBLIC Storefront API access token here (Headless/storefront
 * channel) — this runs in the browser. Never ship an Admin token.
 */

const FALLBACK: Product[] = [
  {
    id: 'fallback-butter-toffee-peanuts',
    title: 'Butter Toffee Peanuts',
    price: 14.99,
    currency: 'USD',
    category: 'retail',
    imageUrl: '/brand/secret-peanuts.jpg',
    imageAlt: 'Butter toffee peanuts',
    url: `${SHOP_URL}/products/butter-toffee-peanuts`,
  },
  {
    id: 'fallback-jumbo-cashews',
    title: 'Jumbo Cashews',
    price: 19.99,
    currency: 'USD',
    category: 'retail',
    imageUrl: '/brand/cashews.jpg',
    imageAlt: 'Roasted jumbo cashews',
    url: `${SHOP_URL}/products/jumbo-cashews`,
  },
  {
    id: 'fallback-dark-chocolate-almonds',
    title: 'Dark Chocolate Almonds',
    price: 19.99,
    currency: 'USD',
    category: 'retail',
    imageUrl: '/brand/dark-chocolate-almonds.jpg',
    imageAlt: 'Dark chocolate covered almonds',
    url: `${SHOP_URL}/products/dark-chocolate-almonds`,
  },
];

const COUNT = 3;

export function useFeaturedProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(FALLBACK);

  useEffect(() => {
    const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;
    const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined;
    if (!domain || !token) return; // unconfigured → keep the curated fallback

    let alive = true;
    const adapter = createShopifyAdapter({ storeDomain: domain, storefrontToken: token });
    adapter
      .getProducts()
      .then((all) => {
        if (!alive) return;
        const featured = all
          .filter((p) => p.category === 'retail' && p.imageUrl)
          .slice(0, COUNT)
          .map((p) => ({
            ...p,
            url: p.url ?? (p.handle ? `${SHOP_URL}/products/${p.handle}` : SHOP_URL),
          }));
        if (featured.length > 0) setProducts(featured);
      })
      .catch(() => {
        /* keep fallback — the reveal must always have something to show */
      });
    return () => {
      alive = false;
    };
  }, []);

  return products;
}
