/**
 * Central config for external links from the marketing site.
 *
 * SHOP_URL is the customer-facing Shopify store. Update it once the custom domain
 * is connected. During launch the store will live at:
 *   https://shop.simplynutsandmore.com
 * Until the domain is wired, you can temporarily point this at the myshopify URL:
 *   https://simply-nuts-and-more-main.myshopify.com
 */
export const SHOP_URL = 'https://shop.simplynutsandmore.com';

/** Deep links to Shopify collections. Handles must match the collections created in Shopify. */
export const SHOP_COLLECTIONS = {
  all: SHOP_URL,
  nuts: `${SHOP_URL}/collections/nuts`,
  trailMixes: `${SHOP_URL}/collections/trail-mixes`,
  chocolates: `${SHOP_URL}/collections/chocolates`,
} as const;
