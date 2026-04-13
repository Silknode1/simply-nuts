/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@remix-run/dev" />

interface Env {
  PUBLIC_STOREFRONT_API_TOKEN: string;
  PUBLIC_STORE_DOMAIN: string;
  PRIVATE_STOREFRONT_API_TOKEN?: string;
  SESSION_SECRET: string;
  DATABASE_URL?: string;
  KLAVIYO_API_KEY?: string;
  CRM_WEBHOOK_URL?: string;
  HYDROGEN_ENV?: string;
}

declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    env: Env;
    storefront: import('@shopify/hydrogen').Storefront;
    waitUntil: (promise: Promise<unknown>) => void;
  }
}
