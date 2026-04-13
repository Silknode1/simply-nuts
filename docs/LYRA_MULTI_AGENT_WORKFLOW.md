# Simply Nuts & More — Multi-Agent Development Workflow
## Lyra-Optimized Parallel Execution Plan

> Generated: 2026-04-10
> Project: `/Users/danielcarney/Documents/simply-nuts-next/`
> Status: Prototype complete, backend missing, Hydrogen not initialized

---

## Architecture Overview

```
PHASE 1 (Parallel)          PHASE 2 (Parallel)           PHASE 3 (Integration)
┌─────────────────┐         ┌──────────────────┐          ┌──────────────────┐
│  🏗️ BACKEND      │────────▶│  🔌 API ROUTES    │─────────▶│  🔗 FRONTEND     │
│  Hydrogen Init   │         │  Draft CRUD       │          │  Wire Real APIs  │
│  Shopify Adapter │         │  Email/Autosave   │          │  Remove Mocks    │
└─────────────────┘         └──────────────────┘          └──────────────────┘
┌─────────────────┐              │                         ┌──────────────────┐
│  🗄️ DATABASE     │──────────────┘                         │  📊 ANALYTICS    │
│  DB Layer        │                                       │  Event Wiring    │
│  Migration Runner│                                       │  Klaviyo + CRM   │
└─────────────────┘                                       └──────────────────┘
┌─────────────────┐         ┌──────────────────┐
│  🧪 TESTING      │────────▶│  🧪 INTEGRATION   │
│  State Machine   │         │  API + E2E Tests  │
│  Package Tests   │         │                   │
└─────────────────┘         └──────────────────┘
┌─────────────────┐         ┌──────────────────┐
│  🚀 DEVOPS       │────────▶│  🚀 STAGING       │
│  Enhanced CI/CD  │         │  Preview Deploy   │
└─────────────────┘         └──────────────────┘
┌─────────────────┐
│  🎨 FRONTEND     │ (runs independently throughout)
│  UI Polish       │
│  Responsive Fixes│
│  Component Extract│
└─────────────────┘
```

---

## PHASE 1 — Foundation (All 5 agents launch in parallel)

### Agent 1: Backend Architect
**Type:** `backend-architect` or `api-scaffolding:fastapi-pro` (adapt for Remix)
**File Ownership:** `apps/storefront-hydrogen/`, `packages/core/src/commerce/shopifyAdapter.ts`

```
PROMPT:
You are the backend architect for Simply Nuts & More, a corporate gifting
company. Your job: initialize the Shopify Hydrogen (Remix-based SSR) app
and implement the real Shopify Storefront API adapter.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

STEP 1 — Initialize Hydrogen
- Run: npx @shopify/create-hydrogen@latest apps/storefront-hydrogen
- Choose TypeScript template
- Configure for npm workspaces (the monorepo uses npm workspaces)
- Ensure it integrates with existing packages: @snm/core, @snm/types, @snm/ui
- Add workspace reference in root package.json

STEP 2 — Implement Shopify Adapter
- Create: packages/core/src/commerce/shopifyAdapter.ts
- Implement the existing CommerceAdapter interface (see packages/core/src/commerce/types.ts):
  - getProducts(): Query Shopify Storefront API for products
  - addToCart(): Create/update Shopify cart via Storefront API
- Use environment variables for Shopify credentials (SHOPIFY_STOREFRONT_TOKEN, SHOPIFY_STORE_DOMAIN)
- Keep adapter framework-agnostic — NO Remix/Hydrogen imports in packages/core

STEP 3 — Scaffold API Routes
- Create Remix action/loader routes in apps/storefront-hydrogen/app/routes/:
  - api.draft.create.ts — POST, creates new DraftOrder
  - api.draft.$id.ts — GET/PUT for draft CRUD
  - api.draft.$id.autosave.ts — PUT, autosave endpoint
  - api.draft.$id.email.ts — POST, email capture
  - api.draft.$id.verify.ts — POST, email verification
  - api.draft.$id.submit.ts — POST, final submission
- Wire routes to the state machine from packages/core/src/customizer/stateMachine.ts
- Use the EventDispatcher from packages/core/src/events/dispatcher.ts to emit events

CONSTRAINTS:
- Read CLAUDE.md before starting — it has workflow rules
- Do NOT put Shopify-specific code in packages/core
- All shared types go in packages/types
- Run npm run typecheck when done
```

---

### Agent 2: Database Architect
**Type:** `database-architect` or `database-design:sql-pro`
**File Ownership:** `db/`, `packages/core/src/db/`

```
PROMPT:
You are the database architect for Simply Nuts & More. Your job: create
a production-ready database access layer for the draft order system.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

EXISTING ASSETS:
- db/migrations/0002_draft_orders.sql (existing migration — read it first)
- packages/types/src/draft-order.ts (DraftOrder, DraftStatus types)
- packages/core/src/customizer/stateMachine.ts (state machine with transitions)

STEP 1 — Choose and Configure DB
- Use SQLite via better-sqlite3 for development (zero-config, file-based)
- Use Turso (libSQL) for production (SQLite-compatible, edge-deployable, free tier)
- Create packages/core/src/db/client.ts with connection setup
- Support both local SQLite file and Turso remote URL via env vars

STEP 2 — Migration Runner
- Create packages/core/src/db/migrate.ts
- Read .sql files from db/migrations/ in order
- Track applied migrations in a _migrations table
- Add npm script: "migrate" in root package.json

STEP 3 — Draft Order Repository
- Create packages/core/src/db/draftRepository.ts
- Implement CRUD operations that match the DraftOrder type:
  - createDraft(draft: DraftOrder): Promise<DraftOrder>
  - getDraft(id: string): Promise<DraftOrder | null>
  - updateDraft(id: string, updates: Partial<DraftOrder>): Promise<DraftOrder>
  - listDraftsByEmail(email: string): Promise<DraftOrder[]>
  - deleteDraft(id: string): Promise<void>
- Map between DB snake_case columns and TypeScript camelCase properties

STEP 4 — Review existing migration
- Read db/migrations/0002_draft_orders.sql
- Add any missing columns needed by the DraftOrder type
- Create 0003_add_missing_columns.sql if needed

CONSTRAINTS:
- Keep everything in packages/core (framework-agnostic)
- All types from packages/types
- Run npm run typecheck when done
```

---

### Agent 3: Testing Specialist
**Type:** `codebase-cleanup:test-automator`
**File Ownership:** `packages/core/src/**/*.test.ts`, `vitest.config.ts`

```
PROMPT:
You are the testing specialist for Simply Nuts & More. Your job: set up
test infrastructure and write comprehensive tests for the existing
shared packages.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

STEP 1 — Set Up Vitest
- Install vitest as a dev dependency in the root workspace
- Create vitest.config.ts at root with workspace support
- Add npm script: "test" → vitest, "test:ci" → vitest run
- Configure path aliases to match existing tsconfig

STEP 2 — Test the State Machine (HIGH PRIORITY)
- Create packages/core/src/customizer/stateMachine.test.ts
- Test ALL valid transitions:
  - anonymous_draft → identified_draft (via CAPTURE_EMAIL)
  - identified_draft → verified_draft (via VERIFY_EMAIL)
  - verified_draft → checkout_ready (via MARK_CHECKOUT_READY)
  - checkout_ready → submitted_order (via CHECKOUT_COMPLETED)
  - submitted_order → in_review (via REQUEST_DESIGN_HELP)
  - in_review → in_production (via START_PRODUCTION)
  - in_production → shipped (via SHIP_ORDER)
- Test ALL invalid transitions throw errors
- Test edge cases:
  - MARK_CHECKOUT_READY without email verification throws
  - Duplicate transitions
  - All fields are preserved across transitions

STEP 3 — Test the Event Dispatcher
- Create packages/core/src/events/dispatcher.test.ts
- Test that dispatch fans out to all sinks
- Test error handling (one sink failing doesn't break others)
- Test event shape matches DraftEvent type

STEP 4 — Test Zod Schemas
- Create packages/core/src/customizer/schemas.test.ts
- Test valid and invalid customizer states
- Test edge cases and boundary values

STEP 5 — Test Commerce Adapter
- Create packages/core/src/commerce/mockAdapter.test.ts
- Verify mock products match expected shape
- Prepare test patterns for future Shopify adapter

CONSTRAINTS:
- Use describe/it/expect patterns
- Aim for >90% coverage on packages/core
- Run tests and verify they pass
```

---

### Agent 4: DevOps Engineer
**Type:** `devops-automator` or `experienced-engineer:devops-engineer`
**File Ownership:** `.github/workflows/`, `Dockerfile`, `.env.example`

```
PROMPT:
You are the DevOps engineer for Simply Nuts & More. Your job: enhance
the CI/CD pipeline and prepare staging deployment infrastructure.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

EXISTING CI:
- .github/workflows/ci.yml — basic build
- .github/workflows/typecheck.yml — TypeScript check
- .github/workflows/claude.yml — Claude Code bot
- .github/workflows/claude-code-review.yml — PR review

STEP 1 — Enhanced CI Pipeline
- Update .github/workflows/ci.yml to include:
  - npm run typecheck
  - npm run test:ci (vitest, once testing agent sets it up)
  - npm run build:prototype
  - Lint check (eslint)
  - Cache node_modules between runs (actions/cache)

STEP 2 — Environment Configuration
- Create .env.example with all required env vars:
  - SHOPIFY_STOREFRONT_TOKEN
  - SHOPIFY_STORE_DOMAIN
  - DATABASE_URL (Turso)
  - KLAVIYO_API_KEY
  - CRM_WEBHOOK_URL
  - SESSION_SECRET
- Create .env.example for apps/storefront-hydrogen/
- Ensure .gitignore includes .env files (verify)

STEP 3 — Docker Development Setup
- Create docker-compose.yml for local development
- Include: app service, optional DB viewer
- Create Dockerfile for the Hydrogen app (multi-stage build)

STEP 4 — Deployment Prep
- Create .github/workflows/deploy-preview.yml
  - Trigger: on pull_request
  - Build Hydrogen app
  - Deploy to Shopify preview (or Vercel/Netlify preview)
- Add deployment documentation to docs/deployment.md

CONSTRAINTS:
- Don't break existing CI workflows
- Keep Docker optional (local dev must work without Docker)
- Run typecheck when done
```

---

### Agent 5: Frontend Developer
**Type:** `frontend-developer` or `application-performance:frontend-developer`
**File Ownership:** `apps/prototype-web/src/components/`, `packages/ui/src/`

```
PROMPT:
You are the frontend developer for Simply Nuts & More. Your job: polish
the existing prototype UI and extract reusable components to the shared
UI package.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

STEP 1 — Extract Shared Components to packages/ui
- Move reusable components from apps/prototype-web/src/components/ to packages/ui/src/:
  - StepProgress.tsx → packages/ui/src/components/StepProgress.tsx
  - ProductCard.tsx → packages/ui/src/components/ProductCard.tsx
  - Button (already exists) — verify it's properly exported
- Update imports in prototype-web to use @snm/ui
- Export all from packages/ui/src/index.ts

STEP 2 — Responsive Audit & Fix
- Review all pages for mobile responsiveness
- Key areas to check:
  - Navbar mobile menu (hamburger)
  - Product grid on small screens
  - CustomizerPage step flow on mobile
  - Cart drawer on narrow viewports
  - Hero section scaling
- Fix any overflow, truncation, or layout breaks

STEP 3 — Replace Inline Styles
- CustomizerPage.tsx has extensive inline styles — convert to CSS classes
- Use existing Tailwind v4 tokens from styles.css
- Maintain the brand aesthetic (wood/gold/cream/burn palette)

STEP 4 — Improve Loading States
- Add skeleton loaders for product grids
- Add loading spinner for form submissions
- Add optimistic UI for cart operations

STEP 5 — Accessibility Audit
- Add proper aria-labels to all interactive elements
- Ensure keyboard navigation works through the customizer flow
- Check color contrast against WCAG AA standards
- Add focus visible styles

CONSTRAINTS:
- Do NOT change routing or page structure
- Keep all brand colors using existing CSS custom properties
- Run npm run typecheck and npm run build:prototype when done
```

---

## PHASE 2 — Integration (After Phase 1 agents complete)

### Agent 6: API Integration
**Type:** `backend-architect`
**Depends on:** Agent 1 (Hydrogen) + Agent 2 (Database)

```
PROMPT:
You are wiring the API routes to the real database layer for Simply Nuts
& More. Phase 1 agents have completed:
- Hydrogen app initialized at apps/storefront-hydrogen/
- Database layer at packages/core/src/db/
- API route scaffolds at apps/storefront-hydrogen/app/routes/

YOUR JOB: Connect the API routes to the real database repository.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

For each API route in apps/storefront-hydrogen/app/routes/:
1. Import the draftRepository from packages/core/src/db/draftRepository
2. Replace any mock/placeholder logic with real DB calls
3. Wire the state machine (reduceDraft) to validate transitions
4. Emit events via EventDispatcher after successful operations
5. Add proper error handling (400 for validation, 404 for not found, 500 for server)
6. Add request validation using Zod schemas from packages/core

Test each route manually or with curl commands and verify the full flow:
  Create draft → Capture email → Verify → Add design → Add recipients → Submit

CONSTRAINTS:
- Follow existing patterns from packages/core
- All DB operations through draftRepository (never raw SQL in routes)
- Run npm run typecheck when done
```

---

### Agent 7: Frontend API Wiring
**Type:** `frontend-developer`
**Depends on:** Agent 6 (API Integration)

```
PROMPT:
You are connecting the Simply Nuts prototype frontend to the real
Hydrogen API backend. The mock handlers are being replaced.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

STEP 1 — Create API Client
- Create apps/prototype-web/src/api/client.ts
- Implement typed fetch wrappers for each endpoint:
  - createDraft() → POST /api/draft/create
  - getDraft(id) → GET /api/draft/:id
  - autosaveDraft(id, data) → PUT /api/draft/:id/autosave
  - captureEmail(id, email) → POST /api/draft/:id/email
  - verifyEmail(id) → POST /api/draft/:id/verify
  - submitDraft(id) → POST /api/draft/:id/submit
- Use proper error handling and TypeScript return types from @snm/types
- Configure base URL from environment variable

STEP 2 — Update CustomizerPage
- Replace local state with useDraftStore hook backed by API client
- On step transitions, call autosaveDraft
- On email submit, call captureEmail
- On final submit, call submitDraft
- Show real order reference from API response

STEP 3 — Update CustomOrderPage
- Wire addToCart through the real CommerceAdapter (Shopify)
- Replace emoji images with real product images from Shopify

STEP 4 — Remove Mock Dependencies
- Delete apps/prototype-web/src/api/mockHandlers.ts (after all calls are replaced)
- Update any components still importing from mockHandlers
- Remove getMockProducts calls — use real Shopify product queries

STEP 5 — Add Error Handling UI
- Toast notifications for save failures
- Retry logic for autosave
- Offline indicator (reuse the sync-dot pattern from the task tracker!)

CONSTRAINTS:
- Keep the app functional during migration (feature-flag if needed)
- Run npm run typecheck and npm run build:prototype when done
```

---

## PHASE 3 — Growth & Polish (After Phase 2)

### Agent 8: Analytics & Events
**Type:** `backend-architect`

```
PROMPT:
Wire the event system to real external services for Simply Nuts & More.

PROJECT ROOT: /Users/danielcarney/Documents/simply-nuts-next/

STEP 1 — Wire Klaviyo Sink
- Update packages/core/src/events/sinks/klaviyoSink.ts
- Implement real Klaviyo API calls (profile creation, event tracking)
- Events to track: draft_created, email_captured, checkout_completed, order_shipped
- Use KLAVIYO_API_KEY from environment

STEP 2 — Wire CRM Sink
- Update packages/core/src/events/sinks/crmSink.ts
- POST to webhook URL on high-intent events
- Events: email_captured (with design details), checkout_completed, design_help_requested
- Use CRM_WEBHOOK_URL from environment

STEP 3 — Add Frontend Event Emission
- Wire EventDispatcher.dispatch() calls in the CustomizerPage flow
- Track: step changes, file uploads, design help requests, time-on-step

STEP 4 — Abandoned Draft Recovery
- Create a scheduled job / cron that finds drafts older than 24h in 'anonymous_draft'
  or 'identified_draft' status
- Emit 'draft_abandoned' event to trigger Klaviyo email flow

CONSTRAINTS:
- Keep sinks independent — one failing must not break others
- Add unit tests for each sink
- Run npm run typecheck when done
```

---

## Execution Timeline

```
DAY 1-2:  Phase 1 — All 5 agents in parallel
          ├── Agent 1: Hydrogen + Shopify adapter
          ├── Agent 2: Database layer
          ├── Agent 3: Test infrastructure + core tests
          ├── Agent 4: CI/CD enhancement
          └── Agent 5: UI polish + component extraction

DAY 3-4:  Phase 2 — Integration (2 agents)
          ├── Agent 6: Wire API → DB (depends on 1+2)
          └── Agent 7: Wire Frontend → API (depends on 6)

DAY 5-6:  Phase 3 — Growth (1 agent + review)
          ├── Agent 8: Events + Klaviyo + CRM
          └── Code review of all changes
```

## Agent Launch Commands

To execute this workflow with Claude Code, use these agent types:

| Agent | Claude Code Agent Type | Priority |
|-------|----------------------|----------|
| 1. Backend | `backend-architect` | P0 — launch first |
| 2. Database | `database-design:database-architect` | P0 — launch first |
| 3. Testing | `codebase-cleanup:test-automator` | P0 — launch first |
| 4. DevOps | `experienced-engineer:devops-engineer` | P0 — launch first |
| 5. Frontend | `application-performance:frontend-developer` | P0 — launch first |
| 6. API Wire | `backend-architect` | P1 — after 1+2 done |
| 7. FE Wire | `frontend-developer` | P1 — after 6 done |
| 8. Events | `backend-architect` | P2 — after 7 done |

## Pre-Launch Checklist

Before starting any agents:
- [ ] Shopify Partner account created
- [ ] Shopify development store provisioned
- [ ] Storefront API access token generated
- [ ] Turso account created (or SQLite chosen for dev-only)
- [ ] Klaviyo account created (can be deferred to Phase 3)
- [ ] All env vars documented in .env.example

---

*Generated by Lyra 4-D Methodology: Deconstructed → Diagnosed → Developed → Delivered*
