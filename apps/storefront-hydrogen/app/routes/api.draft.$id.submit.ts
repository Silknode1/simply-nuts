import type {ActionFunctionArgs} from '@remix-run/node';
import {markCheckoutReadySchema, reduceDraft} from '@snm/core';
import {draftStore} from '../lib/draft-store';
import {dispatcher} from '../lib/events';
import {jsonResponse, errorResponse} from '../lib/context';

/**
 * POST /api/draft/:id/submit
 *
 * Marks a draft as checkout-ready and then transitions to submitted_order.
 * This is the final customer-facing step -- after this, the order enters
 * the internal review/production pipeline.
 *
 * Requires:
 * - Email to be captured (identified_draft or later)
 * - Email to be verified (verified_draft)
 * - Explicit confirmation via confirmNoPendingValidation: true
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

  const parsed = markCheckoutReadySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      422,
    );
  }

  // Two-step transition: verified_draft -> checkout_ready -> submitted_order
  let updated;
  try {
    const checkoutReady = reduceDraft(draft, {type: 'MARK_CHECKOUT_READY'});
    updated = reduceDraft(checkoutReady, {type: 'CHECKOUT_COMPLETED'});
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Invalid state transition';
    return errorResponse(message, 409);
  }

  draftStore.set(updated);

  const now = updated.updatedAt;

  // Emit both events -- checkout_ready and checkout_completed
  await Promise.all([
    dispatcher.dispatch({
      draftOrderId: updated.id,
      type: 'draft_marked_checkout_ready',
      actorType: 'customer',
      createdAt: now,
    }),
    dispatcher.dispatch({
      draftOrderId: updated.id,
      type: 'checkout_completed',
      actorType: 'customer',
      createdAt: now,
      payload: {
        subtotalCents: updated.subtotalCents,
        containerType: updated.containerType,
      },
    }),
  ]);

  return jsonResponse(updated);
}
