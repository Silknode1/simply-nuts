import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/node';
import {draftPatchSchema} from '@snm/core';
import {draftStore} from '../lib/draft-store';
import {dispatcher} from '../lib/events';
import {jsonResponse, errorResponse} from '../lib/context';

/**
 * GET /api/draft/:id
 *
 * Returns the current state of a draft order.
 */
export async function loader({params}: LoaderFunctionArgs) {
  const {id} = params;
  if (!id) return errorResponse('Missing draft id', 400);

  const draft = draftStore.get(id);
  if (!draft) return errorResponse('Draft not found', 404);

  return jsonResponse(draft);
}

/**
 * PUT /api/draft/:id
 *
 * Applies a partial update to a draft order.
 * Only allowed while the draft is in a mutable state
 * (anonymous_draft, identified_draft, verified_draft).
 */
export async function action({request, params}: ActionFunctionArgs) {
  if (request.method !== 'PUT') {
    return errorResponse('Method not allowed', 405);
  }

  const {id} = params;
  if (!id) return errorResponse('Missing draft id', 400);

  const draft = draftStore.get(id);
  if (!draft) return errorResponse('Draft not found', 404);

  const mutableStatuses = [
    'anonymous_draft',
    'identified_draft',
    'verified_draft',
  ] as const;

  if (
    !mutableStatuses.includes(
      draft.status as (typeof mutableStatuses)[number],
    )
  ) {
    return errorResponse(
      `Draft is in status "${draft.status}" and cannot be modified`,
      409,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const parsed = draftPatchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      422,
    );
  }

  const updated = {
    ...draft,
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  draftStore.set(updated);

  await dispatcher.dispatch({
    draftOrderId: updated.id,
    type: 'draft_autosaved',
    actorType: 'customer',
    createdAt: updated.updatedAt,
    payload: parsed.data,
  });

  return jsonResponse(updated);
}
