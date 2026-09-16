import type { Pool, PoolClient } from "pg";
import { getDb } from "@/lib/db/client";
import type { ValidatedLeadPayload } from "./schema";

export type EmailNotificationStatus = "pending" | "sent" | "failed" | "skipped";

export type LeadStatus = "new" | "contacted" | "booked" | "closed";

export type StoredLead = ValidatedLeadPayload & {
  id: string;
  createdAt: string;
  emailNotificationStatus: EmailNotificationStatus;
  status: LeadStatus;
  notes: string;
};

export type LeadFilter = {
  status?: LeadStatus;
  leadType?: ValidatedLeadPayload["leadType"];
  search?: string;
};

type LeadRow = {
  id: string;
  created_at: Date;
  lead_type: string;
  source: string;
  parent_name: string;
  email: string;
  phone: string | null;
  child_age: string | null;
  preferred_contact: string | null;
  message: string | null;
  consent: boolean;
  email_notification_status: EmailNotificationStatus;
  status: LeadStatus;
  notes: string;
};

function rowToLead(row: LeadRow): StoredLead {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    leadType: row.lead_type as ValidatedLeadPayload["leadType"],
    source: row.source as ValidatedLeadPayload["source"],
    parentName: row.parent_name,
    email: row.email,
    phone: row.phone ?? undefined,
    childAge: row.child_age ?? undefined,
    preferredContact: row.preferred_contact ?? undefined,
    message: row.message ?? undefined,
    consent: row.consent as true,
    companyWebsite: "",
    emailNotificationStatus: row.email_notification_status,
    status: row.status,
    notes: row.notes,
  };
}

/** Single atomic INSERT — no read-modify-write race, unlike the old JSON-file store. */
export async function saveLead(lead: ValidatedLeadPayload): Promise<StoredLead> {
  const pool = await getDb();
  const { rows } = await pool.query<LeadRow>(
    `INSERT INTO leads (id, lead_type, source, parent_name, email, phone, child_age, preferred_contact, message, consent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      crypto.randomUUID(),
      lead.leadType,
      lead.source,
      lead.parentName,
      lead.email,
      lead.phone ?? null,
      lead.childAge ?? null,
      lead.preferredContact ?? null,
      lead.message ?? null,
      lead.consent,
    ],
  );
  return rowToLead(rows[0]);
}

/** Called after the (best-effort) email attempt so delivery status never blocks the lead being saved. */
export async function updateLeadEmailStatus(
  id: string,
  status: EmailNotificationStatus,
): Promise<void> {
  const pool = await getDb();
  await pool.query("UPDATE leads SET email_notification_status = $2 WHERE id = $1", [id, status]);
}

/**
 * Accepts an optional `runner` (a Pool or a transaction's checked-out
 * PoolClient) so callers that must commit-or-rollback this update together
 * with another write — e.g. an admin action's audit-log entry — can pass a
 * client from withTransaction() instead of this always grabbing its own
 * connection from the pool.
 */
export async function updateLeadStatusAndNotes(
  id: string,
  patch: { status?: LeadStatus; notes?: string },
  runner?: Pool | PoolClient,
): Promise<StoredLead | null> {
  const db = runner ?? (await getDb());
  const { rows } = await db.query<LeadRow>(
    `UPDATE leads
     SET status = COALESCE($2, status), notes = COALESCE($3, notes)
     WHERE id = $1
     RETURNING *`,
    [id, patch.status ?? null, patch.notes ?? null],
  );
  return rows[0] ? rowToLead(rows[0]) : null;
}

export async function listLeads(filter: LeadFilter = {}): Promise<StoredLead[]> {
  const pool = await getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.status) {
    params.push(filter.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filter.leadType) {
    params.push(filter.leadType);
    conditions.push(`lead_type = $${params.length}`);
  }
  const search = filter.search?.trim().toLowerCase();
  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    conditions.push(
      `(lower(parent_name) LIKE $${idx} OR lower(email) LIKE $${idx} OR lower(notes) LIKE $${idx})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query<LeadRow>(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows.map(rowToLead);
}
