import type {DraftEvent} from '@snm/types/draft-order';
import {getDb} from './client';
import {randomUUID} from 'node:crypto';

// ---------------------------------------------------------------------------
// Row <-> Domain mapping
// ---------------------------------------------------------------------------

interface DraftEventRow {
  id: string;
  draft_order_id: string;
  type: string;
  actor_type: string;
  actor_id: string | null;
  payload: string;
  created_at: string;
}

function rowToEvent(row: DraftEventRow): DraftEvent {
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(row.payload) as Record<string, unknown>;
  } catch {
    // If JSON parsing fails, leave payload as empty object
  }

  return {
    draftOrderId: row.draft_order_id,
    type: row.type as DraftEvent['type'],
    actorType: row.actor_type as DraftEvent['actorType'],
    actorId: row.actor_id ?? undefined,
    payload,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Prepared statements (lazily created)
// ---------------------------------------------------------------------------

let stmtCache: ReturnType<typeof buildStatements> | null = null;

function buildStatements() {
  const db = getDb();

  return {
    insert: db.prepare(`
      INSERT INTO draft_events (id, draft_order_id, type, actor_type, actor_id, payload, created_at)
      VALUES (@id, @draftOrderId, @type, @actorType, @actorId, @payload, @createdAt)
    `),

    selectByDraftId: db.prepare(
      'SELECT * FROM draft_events WHERE draft_order_id = ? ORDER BY created_at ASC'
    ),
  };
}

function getStmts() {
  if (!stmtCache) stmtCache = buildStatements();
  return stmtCache;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Log a draft event to the event store.
 * An auto-generated UUID is used as the event row ID.
 */
export function logEvent(event: DraftEvent): void {
  const stmts = getStmts();

  stmts.insert.run({
    id: randomUUID(),
    draftOrderId: event.draftOrderId,
    type: event.type,
    actorType: event.actorType,
    actorId: event.actorId ?? null,
    payload: JSON.stringify(event.payload ?? {}),
    createdAt: event.createdAt,
  });
}

/**
 * Retrieve all events for a given draft order, in chronological order.
 */
export function getEventsForDraft(draftId: string): DraftEvent[] {
  const stmts = getStmts();
  const rows = stmts.selectByDraftId.all(draftId) as DraftEventRow[];
  return rows.map(rowToEvent);
}

/**
 * Reset the prepared statement cache. Call this if the database connection
 * is closed and reopened (e.g., in tests).
 */
export function resetEventStatementCache(): void {
  stmtCache = null;
}
