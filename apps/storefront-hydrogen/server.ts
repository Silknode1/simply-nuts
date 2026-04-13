import {createStorefrontClient} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import * as build from './build/server';

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    const waitUntil = executionContext.waitUntil.bind(executionContext);

    const {storefront} = createStorefrontClient({
      publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      storeDomain: env.PUBLIC_STORE_DOMAIN,
      privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
      storefrontApiVersion: '2025-01',
    });

    const handleRequest = createRequestHandler({
      build,
      mode: env.HYDROGEN_ENV ?? 'production',
      getLoadContext: () => ({
        env,
        storefront,
        waitUntil,
      }),
    });

    return handleRequest(request);
  },
};
