/**
 * One-time migration: `npm run leads:import-legacy`. Reads the old
 * .data/leads.json flat-file store (pre-Postgres) and inserts any rows not
 * already present in Postgres (matched by id), so leads collected before
 * the database migration aren't lost. Safe to re-run — already-imported
 * rows are skipped.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db/client";

type LegacyLead = {
  id: string;
  createdAt: string;
  leadType: string;
  source: string;
  parentName: string;
  email: string;
  phone?: string;
  childAge?: string;
  preferredContact?: string;
  message?: string;
  consent: boolean;
  emailNotificationStatus: "pending" | "sent" | "failed" | "skipped";
  status: "new" | "contacted" | "booked" | "closed";
  notes?: string;
};

async function main() {
  const legacyPath = path.join(process.cwd(), ".data", "leads.json");
  let leads: LegacyLead[];
  try {
    leads = JSON.parse(await readFile(legacyPath, "utf-8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("No .data/leads.json found — nothing to import.");
      return;
    }
    throw error;
  }

  const pool = await getDb();
  let imported = 0;

  for (const lead of leads) {
    const existing = await pool.query("SELECT id FROM leads WHERE id = $1", [lead.id]);
    if (existing.rows.length > 0) continue;

    await pool.query(
      `INSERT INTO leads (id, created_at, lead_type, source, parent_name, email, phone, child_age, preferred_contact, message, consent, email_notification_status, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        lead.id,
        lead.createdAt,
        lead.leadType,
        lead.source,
        lead.parentName,
        lead.email,
        lead.phone ?? null,
        lead.childAge ?? null,
        lead.preferredContact ?? null,
        lead.message ?? null,
        lead.consent,
        lead.emailNotificationStatus,
        lead.status,
        lead.notes ?? "",
      ],
    );
    imported++;
  }

  console.log(`Imported ${imported} of ${leads.length} legacy leads (rest already present).`);
  await pool.end();
}

main().catch((error) => {
  console.error("Legacy lead import failed:", error);
  process.exit(1);
});
