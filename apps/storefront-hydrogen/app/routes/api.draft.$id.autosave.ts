import type {ActionFunctionArgs} from '@remix-run/node';
import {draftPatchSchema} from '@snm/core';
import {draftStore} from '../lib/draft-store';
import {dispatcher} from '../lib/events';
import {jsonResponse, errorResponse} from '../lib/context';

/**
 * PUT /api/draft/:id/autosave
 *
 * Lightweight autosave endpoint optimized for frequent calls from the
 * customizer UI. Accepts the same patch schema as the main draft PUT
 * but is semantically distinct: autosaves are fire-and-forget from
 * the client's perspective, and the event type is `draft_autosaved`.
 *
 * Rate limiting / debounce should be handled client-side. The server
 * always accepts the latest state.
 */
export async function action({request, params}: ActionFunctionArgs) {
  if (request.method !== 'PUT') {
    return errorResponse('Method not allowed', 405);
  }

  const {id} = params;
  if (!id) return errorResponse('Missing draft id', 400);

  const draft = draftStore.get(id);
  if (!draft) return errorResponse('Draft not found', 404);

  // Autosave is only valid while the draft is still being configured.
  const autosaveStatuses = [
    'anonymous_draft',
    'identified_draft',
    'verified_draft',
  ] as const;

  if (
    !autosaveStatuses.includes(
      draft.status as (typeof autosaveStatuses)[number],
    )
  ) {
    return errorResponse(
      `Autosave not allowed in status "${draft.status}"`,
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

  const now = new Date().toISOString();
  const updated = {
    ...draft,
    ...parsed.data,
    updatedAt: now,
  };

  draftStore.set(updated);

  // Fire-and-forget event dispatch -- we do not block the response.
  dispatcher
    .dispatch({
      draftOrderId: updated.id,
      type: 'draft_autosaved',
      actorType: 'customer',
      createdAt: now,
      payload: parsed.data,
    })
    .catch((err) => {
      console.error('[autosave] Event dispatch failed:', err);
    });

  return jsonResponse({ok: true, updatedAt: now});
}
