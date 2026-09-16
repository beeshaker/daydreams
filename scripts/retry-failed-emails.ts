/**
 * Manual bulk-retry run: `npm run leads:retry-emails`. Same logic as the
 * admin "Retry failed notification emails" button. There's no permanent
 * server yet to schedule this (cron/systemd timer is deferred to the VPS
 * work), so run it by hand until then.
 */
import { getDb } from "@/lib/db/client";
import { retryFailedNotifications } from "@/lib/leads/emailRetry";

async function main() {
  const retried = await retryFailedNotifications();
  console.log(`Retried notification email for ${retried} lead(s).`);

  const pool = await getDb();
  await pool.end();
}

main().catch((error) => {
  console.error("Retrying failed notification emails failed:", error);
  process.exit(1);
});
