import { Pool } from "pg";
import { runMigrations } from "@/lib/db/migrate";

/**
 * Module-scoped singleton pool. `pool` is assigned ONLY after migrations
 * have applied without error, so a failed first call leaves `pool` as null
 * instead of publishing a half-initialized handle — the null-check below
 * doubles as the "run once" guard, and a subsequent getDb() call after a
 * failure opens a fresh pool and retries migrations rather than silently
 * reusing a connection that's missing tables.
 */
let pool: Pool | null = null;
let migrating: Promise<void> | null = null;

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
  });
}

export async function getDb(): Promise<Pool> {
  if (pool) return pool;

  const candidate = createPool();
  // Guard against concurrent callers each starting their own migration run
  // against the same fresh pool before `pool` is assigned.
  if (!migrating) {
    migrating = runMigrations(candidate).catch((error) => {
      migrating = null;
      throw error;
    });
  }

  try {
    await migrating;
  } catch (error) {
    await candidate.end().catch(() => {
      // Best-effort cleanup only — a secondary error while closing a pool
      // that failed to migrate must not mask the original migration error
      // being rethrown below.
    });
    throw error;
  }

  pool = candidate;
  return pool;
}

/**
 * Test-only escape hatch: clears the module-level singleton (ending the
 * underlying pool first, if open) so the next getDb() call opens a fresh
 * pool, re-reading DATABASE_URL and re-running migrations. Not for
 * production use.
 */
export async function __resetForTests(): Promise<void> {
  migrating = null;
  if (pool) {
    await pool.end();
    pool = null;
  }
}
