/**
 * One-time bootstrap: `npm run db:seed-admin`. Creates the first
 * admin_users row from ADMIN_BOOTSTRAP_USERNAME/ADMIN_BOOTSTRAP_PASSWORD if
 * no admin with that username exists yet. Idempotent — safe to re-run
 * (it only inserts, never overwrites an existing row's password), so it
 * can be run again after pulling changes without resetting anyone's
 * credentials.
 */
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { hashPassword } from "@/lib/admin/passwords";

async function main() {
  const username = process.env.ADMIN_BOOTSTRAP_USERNAME;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD must be set to seed the first admin.",
    );
  }

  const pool = await getDb();
  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [username]);
  if (existing.rows.length > 0) {
    console.log(`Admin user "${username}" already exists — skipping.`);
    await pool.end();
    return;
  }

  const passwordHash = await hashPassword(password);
  await pool.query(
    "INSERT INTO admin_users (id, username, password_hash, role) VALUES ($1, $2, $3, 'admin')",
    [randomUUID(), username, passwordHash],
  );
  console.log(`Created admin user "${username}". Log in at /admin/login and enable MFA next.`);
  await pool.end();
}

main().catch((error) => {
  console.error("Seeding admin user failed:", error);
  process.exit(1);
});
