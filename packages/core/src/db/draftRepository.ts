import type {DraftOrder} from '@snm/types/draft-order';
import {getDb} from './client';

// ---------------------------------------------------------------------------
// Row <-> Domain mapping
// ---------------------------------------------------------------------------

/** Shape of a row as stored in SQLite (snake_case, INTEGER booleans). */
interface DraftOrderRow {
  id: string;
  status: string;
  email: string | null;
  email_verified_at: string | null;
  shopify_customer_id: string | null;
  container_type: string | null;
  engraving_text: string | null;
  design_help_requested: number; // SQLite stores booleans as 0/1
  design_help_notes: string | null;
  subtotal_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

/** Convert a database row to a DraftOrder domain object. */
function rowToDraft(row: DraftOrderRow): DraftOrder {
  return {
    id: row.id,
    status: row.status as DraftOrder['status'],
    email: row.email ?? undefined,
    emailVerifiedAt: row.email_verified_at ?? undefined,
    shopifyCustomerId: row.shopify_customer_id ?? undefined,
    containerType: row.container_type as DraftOrder['containerType'],
    engravingText: row.engraving_text ?? undefined,
    designHelpRequested: row.design_help_requested === 1,
    designHelpNotes: row.design_help_notes ?? undefined,
    subtotalCents: row.subtotal_cents,
    currency: row.currency as DraftOrder['currency'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Prepared statements (lazily created on first use for each getDb() instance)
// ---------------------------------------------------------------------------

let stmtCache: ReturnType<typeof buildStatements> | null = null;

function buildStatements() {
  const db = getDb();

  return {
    insert: db.prepare(`
      INSERT INTO draft_orders (
        id, status, email, email_verified_at, shopify_customer_id,
        container_type, engraving_text, design_help_requested,
        design_help_notes, subtotal_cents, currency, created_at, updated_at
      ) VALUES (
        @id, @status, @email, @emailVerifiedAt, @shopifyCustomerId,
        @containerType, @engravingText, @designHelpRequested,
        @designHelpNotes, @subtotalCents, @currency, @createdAt, @updatedAt
      )
    `),

    selectById: db.prepare('SELECT * FROM draft_orders WHERE id = ?'),

    selectByEmail: db.prepare(
      'SELECT * FROM draft_orders WHERE email = ? ORDER BY updated_at DESC'
    ),

    deleteById: db.prepare('DELETE FROM draft_orders WHERE id = ?'),
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
 * Insert a new draft order and return it.
 */
export function createDraft(draft: DraftOrder): DraftOrder {
  const stmts = getStmts();

  stmts.insert.run({
    id: draft.id,
    status: draft.status,
    email: draft.email ?? null,
    emailVerifiedAt: draft.emailVerifiedAt ?? null,
    shopifyCustomerId: draft.shopifyCustomerId ?? null,
    containerType: draft.containerType ?? null,
    engravingText: draft.engravingText ?? null,
    designHelpRequested: draft.designHelpRequested ? 1 : 0,
    designHelpNotes: draft.designHelpNotes ?? null,
    subtotalCents: draft.subtotalCents,
    currency: draft.currency,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  });

  return draft;
}

/**
 * Retrieve a single draft order by ID, or null if not found.
 */
export function getDraft(id: string): DraftOrder | null {
  const stmts = getStmts();
  const row = stmts.selectById.get(id) as DraftOrderRow | undefined;
  return row ? rowToDraft(row) : null;
}

/**
 * Partially update a draft order. Returns the updated DraftOrder.
 * Only the provided fields are overwritten; `updatedAt` is always refreshed.
 *
 * Uses a dynamic UPDATE to avoid overwriting unchanged columns.
 */
export function updateDraft(id: string, updates: Partial<DraftOrder>): DraftOrder {
  const db = getDb();

  // Map camelCase fields to snake_case columns with proper value conversion
  const columnMap: Record<string, {column: string; transform?: (v: unknown) => unknown}> = {
    status: {column: 'status'},
    email: {column: 'email'},
    emailVerifiedAt: {column: 'email_verified_at'},
    shopifyCustomerId: {column: 'shopify_customer_id'},
    containerType: {column: 'container_type'},
    engravingText: {column: 'engraving_text'},
    designHelpRequested: {
      column: 'design_help_requested',
      transform: (v) => (v ? 1 : 0),
    },
    designHelpNotes: {column: 'design_help_notes'},
    subtotalCents: {column: 'subtotal_cents'},
    currency: {column: 'currency'},
  };

  const setClauses: string[] = [];
  const params: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    const mapping = columnMap[key];
    if (!mapping) continue; // skip id, createdAt, updatedAt

    const paramName = key;
    const transformed = mapping.transform ? mapping.transform(value) : (value ?? null);
    setClauses.push(`${mapping.column} = @${paramName}`);
    params[paramName] = transformed;
  }

  // Always update updated_at
  setClauses.push("updated_at = datetime('now')");

  if (setClauses.length === 1) {
    // Only updated_at — still run the update to refresh the timestamp
  }

  const sql = `UPDATE draft_orders SET ${setClauses.join(', ')} WHERE id = @id`;
  params['id'] = id;

  db.prepare(sql).run(params);

  const updated = getDraft(id);
  if (!updated) {
    throw new Error(`Draft order not found after update: ${id}`);
  }

  return updated;
}

/**
 * List all draft orders for a given email address, ordered by most recently updated.
 */
export function listDraftsByEmail(email: string): DraftOrder[] {
  const stmts = getStmts();
  const rows = stmts.selectByEmail.all(email) as DraftOrderRow[];
  return rows.map(rowToDraft);
}

/**
 * Delete a draft order by ID. No-op if the draft does not exist.
 */
export function deleteDraft(id: string): void {
  const stmts = getStmts();
  stmts.deleteById.run(id);
}

/**
 * Reset the prepared statement cache. Call this if the database connection
 * is closed and reopened (e.g., in tests).
 */
export function resetDraftStatementCache(): void {
  stmtCache = null;
}
