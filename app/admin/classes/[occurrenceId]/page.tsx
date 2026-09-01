import Link from "next/link";
import { notFound } from "next/navigation";
import { getOccurrenceById } from "@/lib/classes/store";
import { listSignupsByOccurrence } from "@/lib/classes/signups";
import type { ClassSignup, NotificationChannel, NotificationDeliveryStatus } from "@/lib/classes/types";
import { cancelOccurrenceAction, confirmOccurrenceAction, rescheduleOccurrenceAction } from "../actions";
import { StatusBadge } from "@/components/admin/ClassBadges";

export const metadata = {
  title: "Admin — Class Occurrence",
};

/** Reduces a signup's notification log to the latest status per channel — entries are appended in order, so the last write per channel wins. */
function formatNotificationReadout(signup: ClassSignup): string {
  if (signup.notifications.length === 0) return "—";

  const latestByChannel: Partial<Record<NotificationChannel, NotificationDeliveryStatus>> = {};
  for (const entry of signup.notifications) {
    latestByChannel[entry.channel] = entry.status;
  }

  return `Email: ${latestByChannel.email ?? "—"} · WhatsApp: ${latestByChannel.whatsapp ?? "—"}`;
}

export default async function AdminClassOccurrencePage(props: PageProps<"/admin/classes/[occurrenceId]">) {
  const { occurrenceId } = await props.params;
  const occurrence = await getOccurrenceById(occurrenceId);
  if (!occurrence) notFound();

  const signups = await listSignupsByOccurrence(occurrenceId);

  // An occurrence can be rescheduled more than once — the most recent entry
  // is what it changed from the last time, which is what "Originally" means
  // here (mirrors the same convention in ClassScheduleSection's StatusBadge).
  const latestReschedule = occurrence.rescheduleHistory[occurrence.rescheduleHistory.length - 1];

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/classes" className="text-sm text-brand-lavender-strong underline">
          ← Back to classes
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{occurrence.title}</h1>
          <StatusBadge status={occurrence.status} />
        </div>
        <p className="mt-1 text-sm text-brand-ink/60">
          {occurrence.date} · {occurrence.startTime}–{occurrence.endTime} · {occurrence.zone}
        </p>
        {latestReschedule && (
          <p className="mt-1 text-sm text-brand-ink/50">
            Originally {latestReschedule.fromDate} {latestReschedule.fromStartTime}–
            {latestReschedule.fromEndTime}
          </p>
        )}
        {occurrence.cancelledNote && (
          <p className="mt-1 text-sm text-red-700">Cancellation note: {occurrence.cancelledNote}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <form action={confirmOccurrenceAction} className="rounded-lg border border-brand-ink/10 bg-white p-4">
            <input type="hidden" name="id" value={occurrence.id} />
            <button
              type="submit"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Confirm
            </button>
          </form>

          <form
            action={cancelOccurrenceAction}
            className="flex flex-col gap-2 rounded-lg border border-brand-ink/10 bg-white p-4"
          >
            <input type="hidden" name="id" value={occurrence.id} />
            <label className="flex flex-col gap-1 text-sm font-medium">
              Cancellation note (optional)
              <textarea
                name="note"
                rows={2}
                defaultValue={occurrence.cancelledNote}
                className="w-64 rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="self-start rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Cancel class
            </button>
          </form>

          <form
            action={rescheduleOccurrenceAction}
            className="flex flex-col gap-2 rounded-lg border border-brand-ink/10 bg-white p-4"
          >
            <input type="hidden" name="id" value={occurrence.id} />
            <div className="flex flex-wrap gap-2">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Date
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={occurrence.date}
                  className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Start time
                <input
                  type="time"
                  name="startTime"
                  required
                  defaultValue={occurrence.startTime}
                  className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                End time
                <input
                  type="time"
                  name="endTime"
                  required
                  defaultValue={occurrence.endTime}
                  className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <button
              type="submit"
              className="self-start rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Reschedule
            </button>
          </form>
        </div>

        <h2 className="mt-10 text-lg font-bold">Roster</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-brand-ink/10 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-brand-ink/10 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Party size</th>
                <th className="px-3 py-2">Signed up</th>
                <th className="px-3 py-2">Notifications</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((signup) => (
                <tr key={signup.id} className="border-b border-brand-ink/5 align-top last:border-0">
                  <td className="px-3 py-3 font-medium">{signup.name}</td>
                  <td className="px-3 py-3">{signup.email}</td>
                  <td className="px-3 py-3">{signup.phone}</td>
                  <td className="px-3 py-3">{signup.partySize}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-brand-ink/70">
                    {new Date(signup.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-brand-ink/70">{formatNotificationReadout(signup)}</td>
                </tr>
              ))}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-brand-ink/50">
                    No sign-ups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
