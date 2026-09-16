import { getDb } from "@/lib/db/client";

/**
 * Deletes leads older than `days`, returning the number of rows removed.
 * Retention policy (documented, not yet enforced automatically): leads are
 * eligible for deletion `LEAD_RETENTION_DAYS` days after creation,
 * regardless of status, unless the client specifies a different rule.
 * There's no permanent server yet to run this on a schedule — cron/systemd
 * timer wiring is deferred to the VPS-and-deployment work. Until then this
 * is triggered manually via `npm run leads:purge` or the admin "Purge
 * expired leads" action.
 */
export async function deleteLeadsOlderThan(days: number): Promise<number> {
  const pool = await getDb();
  const result = await pool.query(
    "DELETE FROM leads WHERE created_at < now() - ($1 || ' days')::interval",
    [days],
  );
  return result.rowCount ?? 0;
}
