import { getDb } from "@/lib/db/client";
import { lockKey } from "@/lib/ratelimit/postgresRateLimit";

const GLOBAL_IDENTIFIER = "global";

/**
 * Checks (and, if under quota, records) a global daily usage counter for
 * `bucket` — used e.g. to cap total ElevenLabs conversation-token mints
 * per day regardless of which IP is asking, protecting API spend from a
 * distributed/rotating-IP abuser that a per-IP rate limit alone wouldn't
 * catch. Returns true if the caller is OVER quota (i.e. should be
 * rejected).
 */
export async function checkDailyQuota(bucket: string, max: number): Promise<boolean> {
  const pool = await getDb();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serializes concurrent checks so a burst can't all read "under quota".
    await lockKey(client, bucket, GLOBAL_IDENTIFIER);

    // Previous days' rows are never counted again; without this sweep the
    // global identifier's rows would pile up forever.
    await client.query(
      `DELETE FROM rate_limit_events
       WHERE bucket = $1 AND identifier = $2 AND created_at < date_trunc('day', now())`,
      [bucket, GLOBAL_IDENTIFIER],
    );

    const { rows } = await client.query<{ count: string }>(
      `SELECT count(*) FROM rate_limit_events
       WHERE bucket = $1 AND identifier = $2 AND created_at >= date_trunc('day', now())`,
      [bucket, GLOBAL_IDENTIFIER],
    );
    const currentCount = Number(rows[0].count);

    if (currentCount >= max) {
      await client.query("COMMIT");
      return true;
    }

    await client.query(
      "INSERT INTO rate_limit_events (bucket, identifier) VALUES ($1, $2)",
      [bucket, GLOBAL_IDENTIFIER],
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
