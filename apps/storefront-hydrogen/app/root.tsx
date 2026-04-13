import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@remix-run/node';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  return {
    publicStoreDomain: context.env.PUBLIC_STORE_DOMAIN,
    shop: await storefront.query(LAYOUT_QUERY),
  };
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={data} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
` as const;
