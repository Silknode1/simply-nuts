// Node.js-only exports — DB layer, migrations, etc.
// Import from '@snm/core/server' in server-side code (Hydrogen, CLI, scripts)

export {getDb, closeDb} from './db/client';
export {runMigrations} from './db/migrate';
export {
  createDraft,
  getDraft,
  updateDraft,
  listDraftsByEmail,
  deleteDraft,
} from './db/draftRepository';
export {logEvent, getEventsForDraft} from './db/eventRepository';
