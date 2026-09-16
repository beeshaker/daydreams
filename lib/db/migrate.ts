import { readFileSync } from "node:fs";
import path from "node:path";
import type { Pool, PoolClient } from "pg";

type Migration = { id: string; sql: string };

/**
 * Ordered list of migrations, applied in array order. Each migration's SQL
 * lives in its own lib/db/migrations/<id>.sql file (read eagerly at module
 * load, not lazily inside runMigrations) so a syntax error in a migration
 * file surfaces immediately on import rather than only when a fresh DB
 * happens to need that migration.
 */
const MIGRATIONS: Migration[] = [
  "0001_leads",
  "0002_admin_users",
  "0003_audit_log",
  "0004_rate_limit",
].map((id) => ({
  id,
  sql: readFileSync(path.join(process.cwd(), "lib/db/migrations", `${id}.sql`), "utf-8"),
}));

// Arbitrary fixed lock key shared by every process that might migrate this
// database concurrently (e.g. two app instances booting at once). Postgres
// advisory locks are just a pair of int8/int4 numbers agreed on by
// convention — this one has no meaning beyond "the daydreams migration
// lock".
const MIGRATION_LOCK_KEY = 84_217_001;

/**
 * Applies any migrations in MIGRATIONS not yet recorded in
 * schema_migrations, in order, each inside its own transaction. Safe to
 * call repeatedly (e.g. once per getDb() call guarded by a module-level
 * flag, or from tests directly) — already-applied migrations are skipped,
 * so re-running never raises a duplicate-table/column error.
 *
 * Takes a session-level advisory lock for the duration of the whole run so
 * two processes booting against the same fresh database at once can't both
 * try to create the same table.
 */
export async function runMigrations(pool: Pool): Promise<void> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    try {
      await client.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
          id TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL
        )`,
      );

      const { rows } = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
      const alreadyApplied = new Set(rows.map((row) => row.id));

      for (const migration of MIGRATIONS) {
        if (alreadyApplied.has(migration.id)) continue;

        await client.query("BEGIN");
        try {
          await client.query(migration.sql);
          await client.query(
            "INSERT INTO schema_migrations (id, applied_at) VALUES ($1, now())",
            [migration.id],
          );
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK");
          throw new Error(`Migration ${migration.id} failed: ${(error as Error).message}`, {
            cause: error,
          });
        }
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
    }
  } finally {
    client.release();
  }
}
