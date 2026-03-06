# MVP Backlog (Priority Order)

## P0 Foundation
- Initialize Hydrogen app under `apps/storefront-hydrogen`.
- Implement shared Shopify adapter in `packages/core`.
- Add API routes for draft creation, autosave, email capture, and verification.
- Add DB access layer + migrations runner for draft tables.

## P1 Customizer Workflow
- Build 5-step customizer UI in prototype and mirror in Hydrogen.
- Add design asset upload + validation warnings.
- Add recipient upload wizard (CSV/XLSX/Google Sheet placeholder).
- Add draft sharing links for approvers.

## P2 Automation + Growth
- Wire event dispatcher to Klaviyo profile/events.
- Add abandoned-draft email flow triggers.
- Add internal CRM webhook sink for high-intent leads.
- Add content module scaffolding for blog and campaign pages.

## P3 Operational Scale
- Add internal order queue statuses.
- Add customer-facing status tracking page.
- Add reorder templates for returning corporate accounts.
- Add analytics dashboard for funnel + retention metrics.
