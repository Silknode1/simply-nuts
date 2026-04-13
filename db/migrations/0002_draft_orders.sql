-- Draft orders and related tables (SQLite-compatible)
-- Enums are enforced via CHECK constraints instead of CREATE TYPE.

CREATE TABLE IF NOT EXISTS draft_orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'anonymous_draft'
    CHECK (status IN (
      'anonymous_draft', 'identified_draft', 'verified_draft',
      'checkout_ready', 'submitted_order', 'in_review',
      'in_production', 'shipped'
    )),
  email TEXT,
  email_verified_at TEXT,
  shopify_customer_id TEXT,
  container_type TEXT
    CHECK (container_type IN ('aluminum_tin', 'bamboo_container', 'wooden_box')),
  engraving_text TEXT,
  design_help_requested INTEGER NOT NULL DEFAULT 0,
  design_help_notes TEXT,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_draft_orders_status ON draft_orders(status);
CREATE INDEX IF NOT EXISTS idx_draft_orders_email ON draft_orders(email);

CREATE TABLE IF NOT EXISTS design_assets (
  id TEXT PRIMARY KEY,
  draft_order_id TEXT NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width_px INTEGER,
  height_px INTEGER,
  dpi INTEGER,
  validation_status TEXT NOT NULL DEFAULT 'pass'
    CHECK (validation_status IN ('pass', 'warn', 'fail')),
  validation_messages TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipient_files (
  id TEXT PRIMARY KEY,
  draft_order_id TEXT NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  mapping_json TEXT NOT NULL DEFAULT '{}',
  validation_summary TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipient_rows (
  id TEXT PRIMARY KEY,
  recipient_file_id TEXT NOT NULL REFERENCES recipient_files(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_1 TEXT NOT NULL,
  address_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  validation_status TEXT NOT NULL DEFAULT 'valid'
    CHECK (validation_status IN ('valid', 'invalid', 'duplicate')),
  validation_errors TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_recipient_rows_status ON recipient_rows(validation_status);

CREATE TABLE IF NOT EXISTS draft_share_links (
  id TEXT PRIMARY KEY,
  draft_order_id TEXT NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'approver')),
  expires_at TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
