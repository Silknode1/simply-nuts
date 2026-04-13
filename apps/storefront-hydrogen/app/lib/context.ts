import type {AppLoadContext} from '@remix-run/node';

/**
 * Extracts a typed environment variable from the Remix context.
 * Throws at runtime if the variable is missing.
 */
export function requireEnv(context: AppLoadContext, key: keyof Env): string {
  const value = context.env[key];
  if (!value) {
    throw new Response(`Missing environment variable: ${key}`, {status: 500});
  }
  return value;
}

/**
 * Creates a JSON response with proper headers.
 */
export function jsonResponse<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

/**
 * Creates a JSON error response.
 */
export function errorResponse(
  message: string,
  status: number = 400,
): Response {
  return jsonResponse({error: message}, {status});
}
