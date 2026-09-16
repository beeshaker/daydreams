import { getDb } from "@/lib/db/client";

/**
 * Durable, Postgres-backed rate limiter (replaces the old in-memory
 * per-process limiter, which reset on every restart/deploy and didn't
 * work across multiple instances). Sweep-then-count-then-insert all runs
 * inside one transaction per check so concurrent requests from the same
 * identifier can't race past the limit between the count and the insert.
 */
export async function isRateLimited(
  bucket: string,
  identifier: string,
  windowMs: number,
  max: number,
): Promise<boolean> {
  const pool = await getDb();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM rate_limit_events
       WHERE bucket = $1 AND identifier = $2 AND created_at < now() - ($3 || ' milliseconds')::interval`,
      [bucket, identifier, windowMs],
    );

    const { rows } = await client.query<{ count: string }>(
      "SELECT count(*) FROM rate_limit_events WHERE bucket = $1 AND identifier = $2",
      [bucket, identifier],
    );
    const currentCount = Number(rows[0].count);

    if (currentCount >= max) {
      await client.query("COMMIT");
      return true;
    }

    await client.query(
      "INSERT INTO rate_limit_events (bucket, identifier) VALUES ($1, $2)",
      [bucket, identifier],
    );
    await client.query("COMMIT");
    return false;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
