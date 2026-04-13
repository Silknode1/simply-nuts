import type {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const {products} = await storefront.query(FEATURED_PRODUCTS_QUERY);

  return {products: products.nodes};
}

export default function Homepage() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Simply Nuts &amp; More</h1>
      <p>Corporate gifting with custom laser engraving.</p>
      <h2>Featured Products</h2>
      <ul>
        {products.map((product: {id: string; title: string}) => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
    </div>
  );
}

const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts {
    products(first: 12) {
      nodes {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          nodes {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
` as const;
