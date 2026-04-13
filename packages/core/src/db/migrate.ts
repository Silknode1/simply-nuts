import {readdirSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getDb} from './client';

/**
 * Ensure the internal _migrations tracking table exists.
 */
function ensureMigrationsTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

/**
 * Returns the set of migration names that have already been applied.
 */
function getAppliedMigrations(): Set<string> {
  const db = getDb();
  const rows = db.prepare('SELECT name FROM _migrations ORDER BY name').all() as Array<{
    name: string;
  }>;
  return new Set(rows.map((r) => r.name));
}

/**
 * Locate the migrations directory.
 * Looks for db/migrations/ relative to the project root.
 */
function getMigrationsDir(): string {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(thisDir, '..', '..', '..', '..');
  return resolve(projectRoot, 'db', 'migrations');
}

/**
 * Run all pending SQL migrations from db/migrations/ in alphabetical order.
 *
 * Each migration file is executed inside a transaction. If a migration fails,
 * its transaction is rolled back and the error is re-thrown. Previously applied
 * migrations (tracked in the _migrations table) are skipped.
 *
 * @returns Array of migration names that were applied in this run.
 */
export function runMigrations(): string[] {
  const db = getDb();
  ensureMigrationsTable();

  const applied = getAppliedMigrations();
  const migrationsDir = getMigrationsDir();

  // Read all .sql files sorted alphabetically
  let files: string[];
  try {
    files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const newlyApplied: string[] = [];

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = readFileSync(resolve(migrationsDir, file), 'utf-8');

    // Run each migration in a transaction for atomicity
    const runMigration = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    });

    try {
      runMigration();
      newlyApplied.push(file);
      console.log(`[migrate] Applied: ${file}`);
    } catch (err) {
      console.error(`[migrate] Failed: ${file}`);
      throw err;
    }
  }

  if (newlyApplied.length === 0) {
    console.log('[migrate] No new migrations to apply.');
  } else {
    console.log(`[migrate] Applied ${newlyApplied.length} migration(s).`);
  }

  return newlyApplied;
}
