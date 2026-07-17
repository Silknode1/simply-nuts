export type Product = {
  id: string;
  title: string;
  price: number;
  category: 'retail' | 'corporate';
  /** ISO currency code, e.g. "USD". */
  currency?: string;
  /** URL-safe product handle (slug) on the storefront. */
  handle?: string;
  /** Primary product image. */
  imageUrl?: string;
  imageAlt?: string;
  /** Canonical customer-facing product URL (PDP). */
  url?: string;
};

export type CartLineInput = {
  productId: string;
  quantity: number;
};
