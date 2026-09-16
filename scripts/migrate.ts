/**
 * Manual migration runner: `npm run db:migrate`.
 *
 * There's no permanent VPS/deploy pipeline yet, so this is a deliberate
 * manual step to run after pulling schema changes, rather than something
 * wired into an automated deploy — automating it is deferred to the VPS
 * and deployment work.
 */
import { getDb } from "@/lib/db/client";

async function main() {
  const pool = await getDb();
  console.log("Migrations applied successfully.");
  await pool.end();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
