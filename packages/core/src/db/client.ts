import Database from 'better-sqlite3';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

let instance: InstanceType<typeof Database> | null = null;

/**
 * Resolve the SQLite file path from a DATABASE_URL value.
 * Supports:
 *   file:./db/simply-nuts.db  (relative to project root)
 *   file:///absolute/path.db
 *   ./db/simply-nuts.db       (bare relative path)
 *   /absolute/path.db         (bare absolute path)
 */
function resolveDatabasePath(url: string): string {
  let raw = url;

  // Strip "file://" or "file:" prefix
  if (raw.startsWith('file://')) {
    raw = fileURLToPath(raw);
  } else if (raw.startsWith('file:')) {
    raw = raw.slice('file:'.length);
  }

  // Resolve relative paths against the project root (three levels up from this file:
  //   packages/core/src/db/client.ts -> project root)
  if (!raw.startsWith('/')) {
    const thisDir = dirname(fileURLToPath(import.meta.url));
    const projectRoot = resolve(thisDir, '..', '..', '..', '..');
    raw = resolve(projectRoot, raw);
  }

  return raw;
}

/**
 * Returns the singleton better-sqlite3 Database instance.
 * Initializes on first call with WAL mode enabled for better
 * concurrent read performance.
 */
export function getDb(): InstanceType<typeof Database> {
  if (instance) return instance;

  const dbUrl = process.env['DATABASE_URL'];
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Example: DATABASE_URL=file:./db/simply-nuts.db'
    );
  }

  const dbPath = resolveDatabasePath(dbUrl);
  instance = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance.
  // WAL allows readers and a single writer to operate simultaneously.
  instance.pragma('journal_mode = WAL');

  // Enable foreign key enforcement (off by default in SQLite).
  instance.pragma('foreign_keys = ON');

  return instance;
}

/**
 * Close the database connection and clear the singleton.
 * Useful for graceful shutdown and testing.
 */
export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
