import type { PoolClient } from "pg";
import { getDb } from "@/lib/db/client";

/**
 * Runs `fn` inside a single BEGIN/COMMIT transaction on a checked-out
 * client, rolling back on any thrown error. Use whenever a change needs
 * more than one statement to succeed or fail as a unit — e.g. an admin
 * lead update plus its audit-log entry.
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = await getDb();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    try {
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    client.release();
  }
}
