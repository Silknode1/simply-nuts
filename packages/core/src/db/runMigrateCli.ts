/**
 * CLI entry point for running database migrations.
 * Usage: node --import tsx packages/core/src/db/runMigrateCli.ts
 *
 * Reads DATABASE_URL from environment (or .env file via --env-file flag).
 */
import {runMigrations} from './migrate';
import {closeDb} from './client';

try {
  const applied = runMigrations();
  console.log(`Done. ${applied.length} migration(s) applied.`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exitCode = 1;
} finally {
  closeDb();
}
