-- Draft event log for audit trail and event sourcing.
-- Maps to the DraftEvent TypeScript interface.

CREATE TABLE IF NOT EXISTS draft_events (
  id TEXT PRIMARY KEY,
  draft_order_id TEXT NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN (
      'draft_created', 'draft_autosaved', 'email_captured',
      'email_verified', 'design_asset_uploaded', 'design_validated',
      'recipient_file_uploaded', 'recipient_rows_validated',
      'draft_marked_checkout_ready', 'checkout_completed',
      'design_help_requested', 'order_approved',
      'order_production_started', 'order_shipped'
    )),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'system', 'admin')),
  actor_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_draft_events_draft_order_id ON draft_events(draft_order_id);
CREATE INDEX IF NOT EXISTS idx_draft_events_type ON draft_events(type);
