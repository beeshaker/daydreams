"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";
import { withTransaction } from "@/lib/db/withTransaction";
import { deleteLeadsOlderThan } from "@/lib/leads/retention";
import { retryFailedNotifications } from "@/lib/leads/emailRetry";
import { updateLeadStatusAndNotes, type LeadStatus } from "@/lib/leads/store";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "booked", "closed"];

function isLeadStatus(value: FormDataEntryValue | null): value is LeadStatus {
  return typeof value === "string" && (VALID_STATUSES as string[]).includes(value);
}

export async function updateLeadAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const statusValue = formData.get("status");
  const notesValue = formData.get("notes");

  await withTransaction(async (client) => {
    await updateLeadStatusAndNotes(
      id,
      {
        status: isLeadStatus(statusValue) ? statusValue : undefined,
        notes: typeof notesValue === "string" ? notesValue : undefined,
      },
      client,
    );

    await logAdminAction(
      {
        actorId: session.userId ?? null,
        actorUsername: session.username ?? "unknown",
        action: "lead.update",
        targetType: "lead",
        targetId: id,
      },
      client,
    );
  });

  revalidatePath("/admin/leads");
}

/**
 * Manually triggers deletion of leads past the configured retention
 * window. There's no permanent server yet to run this on a schedule
 * (systemd timer / cron is deferred to the VPS-and-deployment work), so
 * for now this is a button an admin clicks.
 */
export async function purgeExpiredLeadsAction(): Promise<void> {
  const session = await requireAdminSession();
  const retentionDays = Number(process.env.LEAD_RETENTION_DAYS ?? 0);
  if (!retentionDays || retentionDays <= 0) {
    throw new Error("LEAD_RETENTION_DAYS is not configured — set it before purging leads.");
  }

  const deleted = await deleteLeadsOlderThan(retentionDays);

  await logAdminAction({
    actorId: session.userId ?? null,
    actorUsername: session.username ?? "unknown",
    action: "lead.purge_expired",
    metadata: { deleted, retentionDays },
  });

  revalidatePath("/admin/leads");
}

/** Manually re-sends notification emails for leads stuck in "failed". */
export async function retryFailedEmailsAction(): Promise<void> {
  const session = await requireAdminSession();
  const retried = await retryFailedNotifications();

  await logAdminAction({
    actorId: session.userId ?? null,
    actorUsername: session.username ?? "unknown",
    action: "lead.retry_failed_emails",
    metadata: { retried },
  });

  revalidatePath("/admin/leads");
}
