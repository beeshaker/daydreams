import { getDb } from "@/lib/db/client";
import { sendLeadNotification } from "@/lib/leads/email";
import { updateLeadEmailStatus, type StoredLead } from "@/lib/leads/store";

const BACKOFF_DELAYS_MS = [1000, 3000];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a single lead's notification email with a short exponential
 * backoff (fired via next/server's after(), so it runs post-response
 * without delaying the submitting user). Gives up after
 * BACKOFF_DELAYS_MS.length extra attempts and leaves the status as
 * "failed" for the admin-triggered/cron-able bulk retry to pick up later.
 */
export async function retryNotificationWithBackoff(lead: StoredLead): Promise<void> {
  for (const backoffMs of BACKOFF_DELAYS_MS) {
    await delay(backoffMs);
    const status = await sendLeadNotification(lead);
    await updateLeadEmailStatus(lead.id, status);
    if (status === "sent") return;
  }
}

type FailedLeadRow = {
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
  email_notification_status: "pending" | "sent" | "failed" | "skipped";
  status: "new" | "contacted" | "booked" | "closed";
  notes: string;
};

function rowToLead(row: FailedLeadRow): StoredLead {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    leadType: row.lead_type as StoredLead["leadType"],
    source: row.source as StoredLead["source"],
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

/**
 * Bulk-retries every lead currently stuck at emailNotificationStatus
 * "failed" — one attempt each, no backoff (this is already the deliberate
 * retry path, invoked manually via the admin action or `npm run
 * leads:retry-emails` until cron scheduling exists post-VPS). Returns the
 * number of leads attempted.
 */
export async function retryFailedNotifications(): Promise<number> {
  const pool = await getDb();
  const { rows } = await pool.query<FailedLeadRow>(
    "SELECT * FROM leads WHERE email_notification_status = 'failed'",
  );

  for (const row of rows) {
    const lead = rowToLead(row);
    const status = await sendLeadNotification(lead);
    await updateLeadEmailStatus(lead.id, status);
  }

  return rows.length;
}
