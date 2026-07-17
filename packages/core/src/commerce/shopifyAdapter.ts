import type {CartLineInput, Product} from '@snm/types/product';
import type {CommerceAdapter} from './types';

export interface ShopifyAdapterConfig {
  storeDomain: string;
  storefrontToken: string;
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          onlineStoreUrl
          productType
          tags
          featuredImage {
            url(transform: {maxWidth: 640, maxHeight: 640})
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  productType: string;
  tags: string[];
  featuredImage: {url: string; altText: string | null} | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{node: {id: string}}>;
  };
}

function inferCategory(node: ShopifyProductNode): 'retail' | 'corporate' {
  const tags = node.tags.map((t) => t.toLowerCase());
  const type = node.productType.toLowerCase();

  if (
    tags.includes('corporate') ||
    tags.includes('gifting') ||
    tags.includes('engraving') ||
    type.includes('corporate') ||
    type.includes('gift')
  ) {
    return 'corporate';
  }
  return 'retail';
}

function mapToProduct(node: ShopifyProductNode): Product {
  return {
    id: node.id,
    title: node.title,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    currency: node.priceRange.minVariantPrice.currencyCode,
    category: inferCategory(node),
    handle: node.handle,
    imageUrl: node.featuredImage?.url,
    imageAlt: node.featuredImage?.altText ?? undefined,
    // onlineStoreUrl is null until the store is public; callers can fall
    // back to `${SHOP_URL}/products/${handle}`.
    url: node.onlineStoreUrl ?? undefined,
  };
}

async function storefrontFetch<T>(
  config: ShopifyAdapterConfig,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const url = `https://${config.storeDomain}/api/2024-10/graphql.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontToken,
    },
    body: JSON.stringify({query, variables}),
  });

  if (!response.ok) {
    throw new Error(
      `Shopify Storefront API error: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as {data: T; errors?: Array<{message: string}>};

  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }

  return json.data;
}

export function createShopifyAdapter(
  config: ShopifyAdapterConfig,
): CommerceAdapter {
  return {
    async getProducts(): Promise<Product[]> {
      const data = await storefrontFetch<{
        products: {edges: Array<{node: ShopifyProductNode}>};
      }>(config, PRODUCTS_QUERY, {first: 50});

      return data.products.edges.map((edge) => mapToProduct(edge.node));
    },

    async addToCart(
      lines: CartLineInput[],
    ): Promise<{checkoutUrl: string}> {
      const cartLines = lines.map((line) => ({
        merchandiseId: line.productId,
        quantity: line.quantity,
      }));

      const data = await storefrontFetch<{
        cartCreate: {
          cart: {id: string; checkoutUrl: string} | null;
          userErrors: Array<{field: string[]; message: string}>;
        };
      }>(config, CART_CREATE_MUTATION, {input: {lines: cartLines}});

      if (data.cartCreate.userErrors.length > 0) {
        throw new Error(
          `Cart creation failed: ${data.cartCreate.userErrors
            .map((e) => e.message)
            .join(', ')}`,
        );
      }

      if (!data.cartCreate.cart) {
        throw new Error('Cart creation returned no cart');
      }

      return {checkoutUrl: data.cartCreate.cart.checkoutUrl};
    },
  };
}
