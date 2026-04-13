import type {ActionFunctionArgs} from '@remix-run/node';
import {draftCreateSchema, reduceDraft} from '@snm/core';
import type {DraftOrder} from '@snm/types/draft-order';
import {draftStore} from '../lib/draft-store';
import {dispatcher} from '../lib/events';
import {jsonResponse, errorResponse} from '../lib/context';

/**
 * POST /api/draft/create
 *
 * Creates a new anonymous draft order and emits a draft_created event.
 * Accepts an optional containerType in the request body.
 */
export async function action({request}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = draftCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      422,
    );
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const seed: DraftOrder = {
    id,
    status: 'anonymous_draft',
    containerType: parsed.data.containerType,
    designHelpRequested: false,
    subtotalCents: 0,
    currency: 'USD',
    createdAt: now,
    updatedAt: now,
  };

  // Run through the state machine (CREATE_DRAFT is a no-op but keeps
  // the pattern consistent for every route).
  const draft = reduceDraft(seed, {type: 'CREATE_DRAFT'});

  draftStore.set(draft);

  await dispatcher.dispatch({
    draftOrderId: draft.id,
    type: 'draft_created',
    actorType: 'customer',
    createdAt: now,
    payload: {containerType: draft.containerType},
  });

  return jsonResponse(draft, {status: 201});
}
