import type {ActionFunctionArgs} from '@remix-run/node';
import {emailCaptureSchema, reduceDraft} from '@snm/core';
import {draftStore} from '../lib/draft-store';
import {dispatcher} from '../lib/events';
import {jsonResponse, errorResponse} from '../lib/context';

/**
 * POST /api/draft/:id/email
 *
 * Captures the customer's email address on an anonymous draft,
 * transitioning it to `identified_draft` via the state machine.
 *
 * This is the first gate in the funnel -- once email is captured,
 * the Klaviyo sink fires an `email_captured` event that can trigger
 * abandoned-draft recovery flows.
 */
export async function action({request, params}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const {id} = params;
  if (!id) return errorResponse('Missing draft id', 400);

  const draft = draftStore.get(id);
  if (!draft) return errorResponse('Draft not found', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const parsed = emailCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      422,
    );
  }

  let updated;
  try {
    updated = reduceDraft(draft, {
      type: 'CAPTURE_EMAIL',
      email: parsed.data.email,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Invalid state transition';
    return errorResponse(message, 409);
  }

  draftStore.set(updated);

  await dispatcher.dispatch({
    draftOrderId: updated.id,
    type: 'email_captured',
    actorType: 'customer',
    createdAt: updated.updatedAt,
    payload: {email: parsed.data.email},
  });

  return jsonResponse(updated);
}
