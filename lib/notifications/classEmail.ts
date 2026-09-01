import { escapeHtml } from "@/lib/notifications/html";
import type { ClassOccurrence, ClassSignup, OccurrenceReschedule } from "@/lib/classes/types";

/**
 * Best-effort attendee notification via the Resend REST API, mirroring
 * lib/leads/email.ts. Without a RESEND_API_KEY set, this is a no-op that
 * logs instead of throwing — local dev and CI shouldn't require real email
 * credentials to exercise the class-change flow. Failure here is never
 * surfaced to the caller: notifyOccurrenceChange records the outcome in the
 * signup's notification log regardless of whether delivery succeeded.
 */
export async function sendClassCancelledEmail(
  signup: ClassSignup,
  occurrence: ClassOccurrence,
): Promise<"sent" | "failed" | "skipped"> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[classes] RESEND_API_KEY not set — skipping cancellation email for signup ${signup.id}`,
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
        to: signup.email,
        subject: `Class cancelled — ${occurrence.title}`,
        html: `
          <p>Your class <strong>${escapeHtml(occurrence.title)}</strong> on
          ${escapeHtml(occurrence.date)} at ${escapeHtml(occurrence.startTime)} has been cancelled.</p>
          ${occurrence.cancelledNote ? `<p>${escapeHtml(occurrence.cancelledNote)}</p>` : ""}
        `,
      }),
    });

    if (!response.ok) {
      console.error(
        `[classes] Resend responded ${response.status} for cancellation email, signup ${signup.id}`,
      );
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error(`[classes] Failed to send cancellation email for signup ${signup.id}`, error);
    return "failed";
  }
}

export async function sendClassRescheduledEmail(
  signup: ClassSignup,
  occurrence: ClassOccurrence,
  previous: OccurrenceReschedule,
): Promise<"sent" | "failed" | "skipped"> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[classes] RESEND_API_KEY not set — skipping reschedule email for signup ${signup.id}`,
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
        to: signup.email,
        subject: `Class rescheduled — ${occurrence.title}`,
        html: `
          <p>Your class <strong>${escapeHtml(occurrence.title)}</strong> has been rescheduled.</p>
          <p>Previously: ${escapeHtml(previous.fromDate)} at ${escapeHtml(previous.fromStartTime)}</p>
          <p>Now: ${escapeHtml(occurrence.date)} at ${escapeHtml(occurrence.startTime)}</p>
        `,
      }),
    });

    if (!response.ok) {
      console.error(
        `[classes] Resend responded ${response.status} for reschedule email, signup ${signup.id}`,
      );
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error(`[classes] Failed to send reschedule email for signup ${signup.id}`, error);
    return "failed";
  }
}
