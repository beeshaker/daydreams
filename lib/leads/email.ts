import type { StoredLead } from "./store";

const STAFF_NOTIFICATION_EMAIL =
  process.env.LEADS_NOTIFICATION_EMAIL ?? "hello@daydreamsanddumbbells.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Best-effort staff notification via the Resend REST API. Without a
 * RESEND_API_KEY set, this is a no-op that logs instead of throwing — local
 * dev and CI shouldn't require real email credentials to exercise the lead
 * flow. Failure here is never surfaced to the submitting user: the DB write
 * (lib/leads/store.ts) is already the source of truth by the time this runs.
 */
export async function sendLeadNotification(
  lead: StoredLead,
): Promise<"sent" | "failed" | "skipped"> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[leads] RESEND_API_KEY not set — skipping email notification for lead ${lead.id}`,
    );
    return "skipped";
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEADS_FROM_EMAIL ?? "leads@daydreamsanddumbbells.com",
        to: STAFF_NOTIFICATION_EMAIL,
        subject: `New ${lead.leadType} lead — ${lead.parentName}`,
        html: `
          <p>New lead from <strong>${escapeHtml(lead.source)}</strong>.</p>
          <ul>
            <li>Name: ${escapeHtml(lead.parentName)}</li>
            <li>Email: ${escapeHtml(lead.email)}</li>
            ${lead.phone ? `<li>Phone: ${escapeHtml(lead.phone)}</li>` : ""}
            ${lead.childAge ? `<li>Child age: ${escapeHtml(lead.childAge)}</li>` : ""}
            ${lead.preferredContact ? `<li>Preferred contact: ${escapeHtml(lead.preferredContact)}</li>` : ""}
          </ul>
          ${lead.message ? `<p>Message: ${escapeHtml(lead.message)}</p>` : ""}
        `,
      }),
    });

    if (!response.ok) {
      console.error(`[leads] Resend responded ${response.status} for lead ${lead.id}`);
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error(`[leads] Failed to send notification for lead ${lead.id}`, error);
    return "failed";
  }
}
