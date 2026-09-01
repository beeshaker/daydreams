import { appendNotificationLog } from "@/lib/classes/signups";
import type { ClassOccurrence, ClassSignup, NotificationLogEntry, OccurrenceReschedule } from "@/lib/classes/types";
import { sendClassCancelledEmail, sendClassRescheduledEmail } from "@/lib/notifications/classEmail";
import { sendClassCancelledWhatsApp, sendClassRescheduledWhatsApp } from "@/lib/notifications/whatsapp";

/**
 * Notifies every affected signup that an occurrence was cancelled or
 * rescheduled, over both email and WhatsApp. Each signup is handled
 * independently via Promise.allSettled — one signup's notification failure
 * (or a rejected promise from a sender) must never block another signup's
 * notifications from going out or being logged.
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

  await Promise.allSettled(
    signups.map(async (signup) => {
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
    }),
  );
}
