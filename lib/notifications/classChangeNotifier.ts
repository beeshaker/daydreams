import { appendNotificationLog } from "@/lib/classes/signups";
import type { ClassOccurrence, ClassSignup, NotificationLogEntry, OccurrenceReschedule } from "@/lib/classes/types";
import { sendClassCancelledEmail, sendClassRescheduledEmail } from "@/lib/notifications/classEmail";
import { sendClassCancelledWhatsApp, sendClassRescheduledWhatsApp } from "@/lib/notifications/whatsapp";

/**
 * Notifies every affected signup that an occurrence was cancelled or
 * rescheduled, over both email and WhatsApp.
 *
 * Within one signup, the two channels are sent in parallel (they're
 * independent). Across signups, handling is SEQUENTIAL — a `for` loop with
 * an `await` per signup, not a `.map(async ...)` + Promise.allSettled over
 * the whole list. This is required, not just stylistic: each signup's
 * handling ends by calling appendNotificationLog, which does an
 * unsynchronized read-modify-write of the whole class-signups.json file.
 * If multiple signups' appendNotificationLog calls ran concurrently (as
 * they would with .map + allSettled, especially likely when every channel
 * resolves near-instantly via the env-vars-unset "skipped" path), their
 * writes would race and whichever lands last would silently discard every
 * other signup's logged entries. A try/catch per iteration still preserves
 * the original guarantee that one signup's failure can't block another's —
 * it just isn't concurrent anymore.
 */
export async function notifyOccurrenceChange(
  occurrence: ClassOccurrence,
  signups: ClassSignup[],
  changeType: "cancelled" | "rescheduled",
  previous?: OccurrenceReschedule,
): Promise<void> {
  if (changeType === "rescheduled" && !previous) {
    console.error(
      `[classes] notifyOccurrenceChange called with changeType "rescheduled" but no previous schedule for occurrence ${occurrence.id} — skipping notifications`,
    );
    return;
  }

  for (const signup of signups) {
    try {
      const [emailStatus, whatsappStatus] = await Promise.all([
        changeType === "cancelled"
          ? sendClassCancelledEmail(signup, occurrence)
          : sendClassRescheduledEmail(signup, occurrence, previous as OccurrenceReschedule),
        changeType === "cancelled"
          ? sendClassCancelledWhatsApp(signup, occurrence)
          : sendClassRescheduledWhatsApp(signup, occurrence, previous as OccurrenceReschedule),
      ]);

      const sentAt = new Date().toISOString();
      const entries: NotificationLogEntry[] = [
        { changeType, channel: "email", status: emailStatus, sentAt },
        { changeType, channel: "whatsapp", status: whatsappStatus, sentAt },
      ];

      await appendNotificationLog(signup.id, entries);
    } catch (error) {
      console.error(`[classes] notifyOccurrenceChange failed for signup ${signup.id}:`, error);
    }
  }
}
