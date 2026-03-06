CREATE TYPE draft_status AS ENUM (
  'anonymous_draft',
  'identified_draft',
  'verified_draft',
  'checkout_ready',
  'submitted_order',
  'in_review',
  'in_production',
  'shipped'
);

CREATE TYPE container_type AS ENUM ('aluminum_tin', 'bamboo_container', 'wooden_box');
CREATE TYPE validation_status AS ENUM ('pass', 'warn', 'fail');
CREATE TYPE recipient_validation_status AS ENUM ('valid', 'invalid', 'duplicate');

CREATE TABLE draft_orders (
  id UUID PRIMARY KEY,
  status draft_status NOT NULL DEFAULT 'anonymous_draft',
  email TEXT NULL,
  email_verified_at TIMESTAMPTZ NULL,
  shopify_customer_id TEXT NULL,
  container_type container_type NULL,
  engraving_text TEXT NULL,
  design_help_requested BOOLEAN NOT NULL DEFAULT FALSE,
  design_help_notes TEXT NULL,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_draft_orders_status ON draft_orders(status);
CREATE INDEX idx_draft_orders_email ON draft_orders(email);

CREATE TABLE design_assets (
  id UUID PRIMARY KEY,
  draft_order_id UUID NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width_px INTEGER NULL,
  height_px INTEGER NULL,
  dpi INTEGER NULL,
  validation_status validation_status NOT NULL DEFAULT 'pass',
  validation_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipient_files (
  id UUID PRIMARY KEY,
  draft_order_id UUID NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  mapping_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipient_rows (
  id UUID PRIMARY KEY,
  recipient_file_id UUID NOT NULL REFERENCES recipient_files(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NULL,
  address_1 TEXT NOT NULL,
  address_2 TEXT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  validation_status recipient_validation_status NOT NULL DEFAULT 'valid',
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX idx_recipient_rows_status ON recipient_rows(validation_status);

CREATE TABLE draft_share_links (
  id UUID PRIMARY KEY,
  draft_order_id UUID NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'approver')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY,
  draft_order_id UUID NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'system', 'admin')),
  actor_id TEXT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
