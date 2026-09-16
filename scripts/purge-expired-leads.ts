/**
 * Manual retention run: `npm run leads:purge`. There's no permanent server
 * yet to schedule this (cron/systemd timer is deferred to the VPS work),
 * so run it by hand or wire it into a scheduler once one exists.
 */
import { getDb } from "@/lib/db/client";
import { deleteLeadsOlderThan } from "@/lib/leads/retention";

async function main() {
  const retentionDays = Number(process.env.LEAD_RETENTION_DAYS ?? 0);
  if (!retentionDays || retentionDays <= 0) {
    throw new Error("LEAD_RETENTION_DAYS is not configured — set it before purging leads.");
  }

  const deleted = await deleteLeadsOlderThan(retentionDays);
  console.log(`Deleted ${deleted} lead(s) older than ${retentionDays} days.`);

  const pool = await getDb();
  await pool.end();
}

main().catch((error) => {
  console.error("Purging expired leads failed:", error);
  process.exit(1);
});
